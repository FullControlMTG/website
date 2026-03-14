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
