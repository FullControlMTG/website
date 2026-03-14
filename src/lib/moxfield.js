// Unofficial Moxfield API — server-side only; treat responses as enhancement-only.
const MOXFIELD_API_BASE = 'https://api2.moxfield.com/v3';

export function extractMoxfieldId(url) {
  const match = url?.match(/moxfield\.com\/decks\/([^/?#]+)/);
  return match ? match[1] : null;
}

export async function fetchMoxfieldDeck(deckId) {
  const res = await fetch(`${MOXFIELD_API_BASE}/decks/all/${deckId}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Moxfield responded with ${res.status}`);
  return res.json();
}

export function parseMoxfieldDeck(data) {
  const mainboard = data.boards?.mainboard?.cards ?? {};
  const commanders = data.boards?.commanders?.cards ?? {};

  const cardCount = Object.values(mainboard).reduce(
    (sum, card) => sum + (card.quantity ?? 1),
    0,
  );

  return {
    name: data.name,
    format: data.format,
    cardCount,
    commanders: Object.values(commanders).map((c) => ({
      name: c.card?.name,
      imageUrl: c.card?.image_uris?.art_crop ?? c.card?.image_uris?.normal,
    })),
    publicUrl: data.publicUrl,
    updatedAt: data.lastUpdatedAtUtc,
    viewCount: data.viewCount,
    likeCount: data.likeCount,
  };
}

export function buildDecklist(data) {
  function normalizeCard(entry) {
    const c = entry.card;
    return {
      quantity: entry.quantity ?? 1,
      name: c.name,
      typeLine: c.type_line ?? '',
      manaCost: c.mana_cost ?? '',
      cmc: c.cmc ?? 0,
      imageUrl:
        c.image_uris?.normal ??
        c.card_faces?.[0]?.image_uris?.normal ??
        null,
    };
  }

  const boards = data.boards ?? {};
  return {
    commanders: Object.values(boards.commanders?.cards ?? {}).map(normalizeCard),
    mainboard: Object.values(boards.mainboard?.cards ?? {}).map(normalizeCard),
    sideboard: Object.values(boards.sideboard?.cards ?? {}).map(normalizeCard),
  };
}
