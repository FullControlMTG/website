// Pre-warms the Scryfall card-image cache before `next build`.
// Run via the `prebuild` npm script so the cache is fully populated before
// Next.js renders any pages. The populated .cache/scryfall-cards.json is then
// baked into the Docker image, guaranteeing zero cold-start latency for users.
//
// Logic mirrors src/lib/scryfall.js but is self-contained CommonJS so it can
// be run directly with `node scripts/warm-cache.js` without transpilation.

'use strict';

const fs = require('fs');
const path = require('path');

const SCRYFALL_BASE = 'https://api.scryfall.com';
const HEADERS = { 'User-Agent': 'FullControlMTG/1.0' };
const MAX_RETRIES = 4;
const BASE_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30_000;

const DATA_DIR = path.join(__dirname, '..', 'src', 'data', 'decks');
const CACHE_DIR = path.join(__dirname, '..', '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'scryfall-cards.json');

// ---- Deck parsing --------------------------------------------------------

const CARD_LINE_RE = /^(\d+)\s+(.+)$/;
const SET_SUFFIX_RE = /\s+\([A-Z0-9]{2,6}\)\s+\d+.*$/;
const IGNORE_HEADERS = new Set(['deck', 'sideboard', 'commander', 'companion', 'maybeboard', 'maybe', 'about']);

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
    const text = fs.readFileSync(txtPath, 'utf-8');
    for (const name of parseCardNames(text)) names.add(name);
  }
  return names;
}

// ---- Cache I/O -----------------------------------------------------------

function readCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')); }
  catch { return {}; }
}

function writeCache(cache) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// ---- Scryfall fetch with exponential backoff -----------------------------

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchScryfall(url, attempt = 0) {
  let res;
  try {
    res = await fetch(url, { headers: HEADERS });
  } catch {
    if (attempt >= MAX_RETRIES) return null;
    await sleep(Math.min(BASE_BACKOFF_MS * 2 ** attempt, MAX_BACKOFF_MS));
    return fetchScryfall(url, attempt + 1);
  }

  if (res.ok) return res.json();
  if (res.status === 404) return null;
  if (attempt >= MAX_RETRIES) return null;

  const retryAfter = res.headers.get('Retry-After');
  const backoff = retryAfter
    ? Math.ceil(parseFloat(retryAfter)) * 1000
    : BASE_BACKOFF_MS * 2 ** attempt;

  await sleep(Math.min(backoff, MAX_BACKOFF_MS));
  return fetchScryfall(url, attempt + 1);
}

function extractImageUrl(card) {
  return card?.image_uris?.normal
    ?? card?.card_faces?.[0]?.image_uris?.normal
    ?? null;
}

async function resolveCard(name) {
  const exact = await fetchScryfall(
    `${SCRYFALL_BASE}/cards/named?` + new URLSearchParams({ exact: name })
  );
  if (exact) return extractImageUrl(exact);

  const fuzzy = await fetchScryfall(
    `${SCRYFALL_BASE}/cards/named?` + new URLSearchParams({ fuzzy: name })
  );
  return fuzzy ? extractImageUrl(fuzzy) : null;
}

// ---- Main ----------------------------------------------------------------

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
    `warm-cache: ${cache ? Object.keys(cache).length : 0} cards cached, ` +
    `fetching ${toFetch.length} new card(s) from Scryfall…`
  );

  const results = await Promise.all(
    toFetch.map(async (name) => {
      const url = await resolveCard(name);
      if (url) process.stdout.write('.');
      else process.stdout.write('x');
      return [name, url];
    })
  );
  process.stdout.write('\n');

  let added = 0;
  for (const [name, url] of results) {
    if (url) { cache[name] = url; added++; }
    else console.warn(`  warn: no image found for "${name}"`);
  }

  writeCache(cache);
  console.log(`warm-cache: done. ${added}/${toFetch.length} new cards cached (${Object.keys(cache).length} total).`);
})();
