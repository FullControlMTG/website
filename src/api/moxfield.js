// Unofficial API — CORS may block requests from production origins; treat responses as enhancement-only.
const MOXFIELD_API_BASE = 'https://api2.moxfield.com/v3';

export async function fetchMoxfieldDeck(deckId) {
  const url = `${MOXFIELD_API_BASE}/decks/all/${deckId}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Moxfield API responded with ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function extractMoxfieldId(url) {
  const match = url?.match(/moxfield\.com\/decks\/([^/?#]+)/);
  return match ? match[1] : null;
}

export function buildDecklist(data) {
  function normalizeCard(entry) {
    const c = entry.card;
    // Double-faced cards carry image_uris on card_faces[0] rather than the card root
    const imageUrl =
      c.image_uris?.normal ??
      c.card_faces?.[0]?.image_uris?.normal ??
      null;
    return {
      quantity: entry.quantity ?? 1,
      name: c.name,
      typeLine: c.type_line ?? '',
      manaCost: c.mana_cost ?? '',
      cmc: c.cmc ?? 0,
      imageUrl,
    };
  }

  const boards = data.boards ?? {};
  return {
    commanders: Object.values(boards.commanders?.cards ?? {}).map(normalizeCard),
    mainboard:  Object.values(boards.mainboard?.cards  ?? {}).map(normalizeCard),
    sideboard:  Object.values(boards.sideboard?.cards  ?? {}).map(normalizeCard),
  };
}

export function parseMoxfieldDeck(data) {
  const mainboard = data.boards?.mainboard?.cards ?? {};
  const commanders = data.boards?.commanders?.cards ?? {};

  const cardCount = Object.values(mainboard).reduce(
    (sum, card) => sum + (card.quantity ?? 1),
    0,
  );

  const commanderList = Object.values(commanders).map((c) => ({
    name: c.card?.name,
    imageUrl: c.card?.image_uris?.art_crop ?? c.card?.image_uris?.normal,
  }));

  return {
    name: data.name,
    description: data.description,
    format: data.format,
    colors: data.colorPercentages,
    cardCount,
    commanders: commanderList,
    publicUrl: data.publicUrl,
    updatedAt: data.lastUpdatedAtUtc,
    viewCount: data.viewCount,
    likeCount: data.likeCount,
  };
}
