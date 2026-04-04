import fs from 'fs';
import path from 'path';

// Server-side Scryfall enrichment with a persistent disk cache.
//
// Cache lives at .cache/scryfall-cards.json relative to process.cwd().
//   - Dev:  {project root}/.cache/scryfall-cards.json
//   - Prod: /app/.cache/scryfall-cards.json  (Docker volume-mounted)
//
// Only cards missing from the cache reach Scryfall. Requests are sequential
// with a 120ms delay to stay under Scryfall's 10 req/s rate limit.

const SCRYFALL_BASE = 'https://api.scryfall.com';
const HEADERS = { 'User-Agent': 'FullControlMTG/1.0' };
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

// --- Scryfall fetch ---

function extractImageUrl(card) {
  return (
    card?.image_uris?.normal ??
    card?.card_faces?.[0]?.image_uris?.normal ??
    null
  );
}

async function fetchCardByName(name) {
  // Try exact match first; fall back to fuzzy for alternate names / typos.
  // Only cache successful 200 responses — don't persist 404s.
  const exactUrl =
    `${SCRYFALL_BASE}/cards/named?` + new URLSearchParams({ exact: name });
  const res = await fetch(exactUrl, {
    headers: HEADERS,
    next: { revalidate: 86400 },
  });
  if (res.ok) return res.json();

  const fuzzyUrl =
    `${SCRYFALL_BASE}/cards/named?` + new URLSearchParams({ fuzzy: name });
  const fuzzyRes = await fetch(fuzzyUrl, {
    headers: HEADERS,
    cache: res.status === 404 ? 'no-store' : undefined,
    next: res.status === 404 ? undefined : { revalidate: 86400 },
  });
  return fuzzyRes.ok ? fuzzyRes.json() : null;
}

// --- Public API ---

/**
 * Fetches Scryfall images for any cards in the decklist that have imageUrl === null.
 * Checks the disk cache first; only hits Scryfall for cards that aren't cached yet.
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

  // Unique names not already in the disk cache.
  const seen = new Set();
  const toFetch = [];
  for (const card of needImages) {
    if (!seen.has(card.name) && !cache[card.name]) {
      seen.add(card.name);
      toFetch.push(card.name);
    }
  }

  // Fetch missing cards sequentially — 120ms apart to respect Scryfall's rate limit.
  for (let i = 0; i < toFetch.length; i++) {
    const name = toFetch[i];
    try {
      const data = await fetchCardByName(name);
      const url = extractImageUrl(data);
      if (url) cache[name] = url;
    } catch {
      // Leave this card without an image; it will be retried next render.
    }
    if (i < toFetch.length - 1) {
      await new Promise((r) => setTimeout(r, 120));
    }
  }

  // Persist any new entries back to disk.
  if (toFetch.length > 0) {
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
