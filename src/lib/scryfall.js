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
    next: { revalidate: 86400 },
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

  // Fetch all cards in parallel — GET requests are cached by Next.js fetch.
  const entries = await Promise.all(
    uniqueNames.map(async (name) => {
      try {
        const data = await fetchCardByName(name);
        return [name, extractImageUrl(data)];
      } catch {
        return [name, null];
      }
    })
  );

  const imageMap = Object.fromEntries(entries.filter(([, url]) => url !== null));

  for (const card of allCards) {
    if (!card.imageUrl && imageMap[card.name]) {
      card.imageUrl = imageMap[card.name];
    }
  }

  return decklist;
}
