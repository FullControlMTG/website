import fs from 'fs';
import path from 'path';

// Server-side Scryfall enrichment with a persistent disk cache.
//
// Cache lives at .cache/scryfall-cards.json relative to process.cwd().
//   - Dev:  {project root}/.cache/scryfall-cards.json
//   - Prod: /app/.cache/scryfall-cards.json  (Docker volume-mounted)
//
// Cards missing from the disk cache are fetched in parallel. Each individual
// request retries on transient errors (429, 5xx) using exponential backoff,
// respecting Scryfall's Retry-After header when present. 404s skip to the
// fuzzy fallback immediately; persistent failures are left without an image.

const SCRYFALL_BASE = 'https://api.scryfall.com';
const HEADERS = { 'User-Agent': 'FullControlMTG/1.0' };

const MAX_RETRIES = 4;
const BASE_BACKOFF_MS = 1000; // doubles each attempt: 1s, 2s, 4s, 8s
const MAX_BACKOFF_MS = 30_000;

const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'scryfall-cards.json');

// --- Disk cache ---

function readCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeCache(cache) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch {
    // Non-fatal — a failed write just means we re-fetch next time.
  }
}

// --- Retry-aware fetch ---

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fetch a single Scryfall URL with exponential backoff.
 * - 200: returns parsed JSON
 * - 404: returns null immediately (terminal — caller may try a different URL)
 * - 429 / 5xx: retries up to MAX_RETRIES, honouring Retry-After if present
 * - Network error: retries up to MAX_RETRIES
 */
async function fetchScryfall(url, attempt = 0) {
  let res;
  try {
    // cache: 'no-store' so retries always make a fresh request and we never
    // cache an error response through the Next.js fetch layer.
    res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
  } catch (err) {
    // Network-level failure (DNS, timeout, etc.)
    if (attempt >= MAX_RETRIES) return null;
    await sleep(Math.min(BASE_BACKOFF_MS * 2 ** attempt, MAX_BACKOFF_MS));
    return fetchScryfall(url, attempt + 1);
  }

  if (res.ok) return res.json();

  // 404 = card not found at this exact URL; let the caller try fuzzy.
  if (res.status === 404) return null;

  // Anything else (429, 503, …) — retry with backoff.
  if (attempt >= MAX_RETRIES) return null;

  const retryAfter = res.headers.get('Retry-After');
  const backoff = retryAfter
    ? Math.ceil(parseFloat(retryAfter)) * 1000
    : BASE_BACKOFF_MS * 2 ** attempt;

  await sleep(Math.min(backoff, MAX_BACKOFF_MS));
  return fetchScryfall(url, attempt + 1);
}

// --- Card lookup ---

function extractImageUrl(card) {
  return (
    card?.image_uris?.normal ??
    card?.card_faces?.[0]?.image_uris?.normal ??
    null
  );
}

async function fetchCardByName(name) {
  const exactUrl =
    `${SCRYFALL_BASE}/cards/named?` + new URLSearchParams({ exact: name });
  const exact = await fetchScryfall(exactUrl);
  if (exact) return exact;

  // Exact match returned null (404 or exhausted retries) — try fuzzy.
  const fuzzyUrl =
    `${SCRYFALL_BASE}/cards/named?` + new URLSearchParams({ fuzzy: name });
  return fetchScryfall(fuzzyUrl);
}

// --- Public API ---

/**
 * Fetches Scryfall images for any cards in the decklist that have imageUrl === null.
 * Checks the disk cache first; only hits Scryfall for cards that aren't cached yet.
 * All missing cards are fetched in parallel; each retries independently on failure.
 * Mutates cards in-place and returns the same decklist object.
 */
export async function enrichWithScryfallImages(decklist) {
  const allCards = [
    ...decklist.commanders,
    ...decklist.mainboard,
    ...decklist.sideboard,
  ];

  const needImages = allCards.filter((c) => !c.imageUrl);
  if (!needImages.length) return decklist;

  const cache = readCache();

  // Unique names not already resolved in the disk cache.
  const seen = new Set();
  const toFetch = [];
  for (const card of needImages) {
    if (!seen.has(card.name) && !cache[card.name]) {
      seen.add(card.name);
      toFetch.push(card.name);
    }
  }

  // Fetch all missing cards in parallel; each retries independently on error.
  if (toFetch.length > 0) {
    const results = await Promise.all(
      toFetch.map(async (name) => {
        try {
          const data = await fetchCardByName(name);
          return [name, extractImageUrl(data)];
        } catch {
          return [name, null];
        }
      })
    );

    for (const [name, url] of results) {
      if (url) cache[name] = url;
    }

    writeCache(cache);
  }

  // Apply cached URLs to all matching cards.
  for (const card of allCards) {
    if (!card.imageUrl && cache[card.name]) {
      card.imageUrl = cache[card.name];
    }
  }

  return decklist;
}
