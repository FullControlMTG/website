'use strict';

const fs = require('fs');
const path = require('path');

const SCRYFALL_COLLECTION = 'https://api.scryfall.com/cards/collection';
const SCRYFALL_NAMED = 'https://api.scryfall.com/cards/named';
const HEADERS = { 'Content-Type': 'application/json', 'User-Agent': 'FullControlMTG/1.0' };
const BATCH_SIZE = 75;
const MAX_RETRIES = 4;
const BASE_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30_000;

const DATA_DIR = path.join(__dirname, '..', 'src', 'data', 'decks');
const CACHE_DIR = path.join(__dirname, '..', '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'scryfall-cards.json');

const CARD_LINE_RE = /^(\d+)\s+(.+)$/;
const SET_SUFFIX_RE = /\s+\([A-Z0-9]{2,6}\)\s+\d+.*$/;
const IGNORE_HEADERS = new Set([
  'deck', 'sideboard', 'commander', 'companion', 'maybeboard', 'maybe', 'about',
]);

function parseCardNames(text) {
  const names = new Set();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || IGNORE_HEADERS.has(line.toLowerCase())) continue;
    const m = line.match(CARD_LINE_RE);
    if (!m) continue;
    const name = m[2].replace(SET_SUFFIX_RE, '').replace('*CMDR*', '').trim();
    if (name) names.add(name);
  }
  return names;
}

function collectAllCardNames() {
  const names = new Set();
  if (!fs.existsSync(DATA_DIR)) return names;
  for (const slug of fs.readdirSync(DATA_DIR)) {
    const txtPath = path.join(DATA_DIR, slug, 'deck.txt');
    if (!fs.existsSync(txtPath)) continue;
    for (const name of parseCardNames(fs.readFileSync(txtPath, 'utf-8'))) {
      names.add(name);
    }
  }
  return names;
}

function readCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')); }
  catch { return {}; }
}

function writeCache(cache) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url, options = {}, attempt = 0) {
  let res;
  try {
    res = await fetch(url, { ...options, headers: { ...HEADERS, ...options.headers } });
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

function extractImageUrl(card) {
  return card?.image_uris?.normal
    ?? card?.card_faces?.[0]?.image_uris?.normal
    ?? null;
}

async function resolveBatch(names) {
  const data = await fetchWithRetry(SCRYFALL_COLLECTION, {
    method: 'POST',
    body: JSON.stringify({ identifiers: names.map((name) => ({ name })) }),
  });

  // Split cards are returned as "Front // Back" but deck.txt only has "Front".
  const inputIndex = {};
  for (const name of names) inputIndex[name.toLowerCase()] = name;

  const found = {};
  for (const card of data?.data ?? []) {
    const url = extractImageUrl(card);
    if (!url) continue;
    const key =
      inputIndex[card.name.toLowerCase()] ??
      inputIndex[card.name.split(' // ')[0].toLowerCase()];
    if (key) found[key] = url;
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

(async () => {
  const allNames = collectAllCardNames();
  if (allNames.size === 0) {
    console.log('warm-cache: no deck.txt files found, nothing to do.');
    return;
  }

  const cache = readCache();
  const toFetch = [...allNames].filter((n) => !cache[n]);

  if (toFetch.length === 0) {
    console.log(`warm-cache: all ${allNames.size} cards already cached.`);
    return;
  }

  console.log(
    `warm-cache: ${Object.keys(cache).length} cards cached — ` +
    `resolving ${toFetch.length} new card(s) via Scryfall…`
  );

  const fuzzyQueue = [];
  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batch = toFetch.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(toFetch.length / BATCH_SIZE);
    process.stdout.write(`  batch ${batchNum}/${totalBatches} (${batch.length} cards)… `);

    const { found, notFound } = await resolveBatch(batch);

    for (const [name, url] of Object.entries(found)) cache[name] = url;
    process.stdout.write(`${Object.keys(found).length} resolved`);

    if (notFound.length) {
      process.stdout.write(`, ${notFound.length} not found (queued for fuzzy)`);
      fuzzyQueue.push(...notFound);
    }
    process.stdout.write('\n');
  }

  if (fuzzyQueue.length > 0) {
    console.log(`  fuzzy fallback for ${fuzzyQueue.length} card(s)…`);
    const results = await Promise.all(
      fuzzyQueue.map(async (name) => [name, await resolveFuzzy(name)])
    );
    for (const [name, url] of results) {
      if (url) { cache[name] = url; process.stdout.write('.'); }
      else { process.stdout.write('x'); console.warn(`\n  warn: no image found for "${name}"`); }
    }
    process.stdout.write('\n');
  }

  writeCache(cache);
  console.log(`warm-cache: done. ${Object.keys(cache).length} total cards cached.`);
})();
