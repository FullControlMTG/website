import fs from 'fs';
import path from 'path';

// Server-side Scryfall enrichment with a persistent disk cache.
//
// Cache lives at .cache/scryfall-cards.json relative to process.cwd().
// Cards missing from the disk cache are resolved via POST /cards/collection
// (up to 75 per request) with exponential backoff on failure.
// Unmatched cards fall back to GET /cards/named?fuzzy=.

const SCRYFALL_COLLECTION = 'https://api.scryfall.com/cards/collection';
const SCRYFALL_NAMED = 'https://api.scryfall.com/cards/named';
const HEADERS = { 'Content-Type': 'application/json', 'User-Agent': 'FullControlMTG/1.0' };
const BATCH_SIZE = 75;
const MAX_RETRIES = 4;
const BASE_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30_000;

const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'scryfall-cards.json');

// --- Disk cache ---

function readCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')); }
  catch { return {}; }
}

function writeCache(cache) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch {
    // Non-fatal — a failed write just means we re-fetch next render.
  }
}

// --- Retry-aware fetch ---

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url, options = {}, attempt = 0) {
  let res;
  try {
    res = await fetch(url, { ...options, headers: HEADERS, cache: 'no-store' });
  } catch {
    if (attempt >= MAX_RETRIES) return null;
    await sleep(Math.min(BASE_BACKOFF_MS * 2 ** attempt, MAX_BACKOFF_MS));
    return fetchWithRetry(url, options, attempt + 1);
  }

  if (res.ok) return res.json();
  if (res.status === 404) return null;
  if (attempt >= MAX_RETRIES) return null;

  const retryAfter = res.headers.get('Retry-After');
  const backoff = retryAfter
    ? Math.ceil(parseFloat(retryAfter)) * 1000
    : BASE_BACKOFF_MS * 2 ** attempt;

  await sleep(Math.min(backoff, MAX_BACKOFF_MS));
  return fetchWithRetry(url, options, attempt + 1);
}

// --- Scryfall resolution ---

function extractImageUrl(card) {
  return (
    card?.image_uris?.normal ??
    card?.card_faces?.[0]?.image_uris?.normal ??
    null
  );
}

async function resolveBatch(names) {
  const data = await fetchWithRetry(SCRYFALL_COLLECTION, {
    method: 'POST',
    body: JSON.stringify({ identifiers: names.map((name) => ({ name })) }),
  });

  const found = {};
  for (const card of data?.data ?? []) {
    const url = extractImageUrl(card);
    if (url) found[card.name] = url;
  }
  const notFound = (data?.not_found ?? []).map((id) => id.name).filter(Boolean);
  return { found, notFound };
}

async function resolveFuzzy(name) {
  const data = await fetchWithRetry(
    `${SCRYFALL_NAMED}?` + new URLSearchParams({ fuzzy: name })
  );
  return data ? extractImageUrl(data) : null;
}

// --- Public API ---

/**
 * Fetches Scryfall images for any cards in the decklist that have imageUrl === null.
 * Checks the disk cache first; only hits Scryfall for cards that aren't cached yet.
 * Uses POST /cards/collection for batch resolution, with fuzzy GET fallback.
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

  const seen = new Set();
  const toFetch = [];
  for (const card of needImages) {
    if (!seen.has(card.name) && !cache[card.name]) {
      seen.add(card.name);
      toFetch.push(card.name);
    }
  }

  if (toFetch.length > 0) {
    const fuzzyQueue = [];

    for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
      const { found, notFound } = await resolveBatch(toFetch.slice(i, i + BATCH_SIZE));
      for (const [name, url] of Object.entries(found)) cache[name] = url;
      fuzzyQueue.push(...notFound);
    }

    // Fuzzy fallback in parallel — only a handful of cards ever reach this.
    if (fuzzyQueue.length > 0) {
      const results = await Promise.all(
        fuzzyQueue.map(async (name) => [name, await resolveFuzzy(name)])
      );
      for (const [name, url] of results) {
        if (url) cache[name] = url;
      }
    }

    writeCache(cache);
  }

  for (const card of allCards) {
    if (!card.imageUrl && cache[card.name]) {
      card.imageUrl = cache[card.name];
    }
  }

  return decklist;
}
