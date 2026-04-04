// Server-side Scryfall enrichment — adds imageUrl to cards that don't have one.
// Uses GET /cards/named per unique card so Next.js fetch can cache each response
// individually for 24 hours. Requests are parallelised so latency = slowest single card.

const SCRYFALL_BASE = 'https://api.scryfall.com';
const HEADERS = { 'User-Agent': 'FullControlMTG/1.0' };

function extractImageUrl(card) {
  return (
    card?.image_uris?.normal ??
    card?.card_faces?.[0]?.image_uris?.normal ??
    null
  );
}

async function fetchCardByName(name) {
  // Try exact match first, fall back to fuzzy for alternate names / typos.
  // Only cache successful responses — failures use no-store so a retry on the
  // next request can succeed rather than serving a cached 404.
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

/**
 * Fetches Scryfall images for any cards in the decklist that have imageUrl === null.
 * Each unique card name is one cached GET request; all run in parallel.
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

  // Collect unique names to avoid redundant fetches.
  const seen = new Set();
  const uniqueNames = [];
  for (const card of needImages) {
    if (!seen.has(card.name)) {
      seen.add(card.name);
      uniqueNames.push(card.name);
    }
  }

  // Fetch cards sequentially with a small delay to respect Scryfall's 10 req/s
  // rate limit. Parallel requests during `next build` would exceed it and cause
  // some cards to silently fail and get baked into the static HTML with no image.
  // Results are cached by Next.js fetch for 24h so this delay only applies once.
  const imageMap = {};
  for (const name of uniqueNames) {
    try {
      const data = await fetchCardByName(name);
      const url = extractImageUrl(data);
      if (url) imageMap[name] = url;
    } catch {
      // leave this card without an image
    }
    await new Promise((r) => setTimeout(r, 120));
  }

  for (const card of allCards) {
    if (!card.imageUrl && imageMap[card.name]) {
      card.imageUrl = imageMap[card.name];
    }
  }

  return decklist;
}
