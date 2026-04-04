const SECTION_HEADERS = {
  about: 'ignore',
  deck: 'main',
  commander: 'commander',
  sideboard: 'side',
  companion: 'side',
  maybeboard: 'maybe',
  maybe: 'maybe',
};

const CARD_LINE_RE = /^(\d+)\s+(.+)$/;
const SET_SUFFIX_RE = /\s+\(([A-Z0-9]{2,6})\)\s+(\d+).*$/;

function parseLine(raw) {
  const line = raw.trim();
  if (!line) return null;

  const lower = line.toLowerCase();
  if (lower in SECTION_HEADERS) return { type: 'section', section: SECTION_HEADERS[lower] };

  const m = line.match(CARD_LINE_RE);
  if (!m) return null;

  const quantity = parseInt(m[1], 10);
  let name = m[2];
  let set = null;
  let collectorNumber = null;

  const setMatch = name.match(SET_SUFFIX_RE);
  if (setMatch) {
    set = setMatch[1].toLowerCase();
    collectorNumber = setMatch[2];
    name = name.replace(SET_SUFFIX_RE, '');
  }
  name = name.trim();

  if (!name) return null;
  return { type: 'card', quantity, name, set, collectorNumber };
}

export function parseDeckTxt(text) {
  const commanders = [];
  const mainboard = [];
  const sideboard = [];

  let section = 'main'; // default section before any header

  for (const raw of text.split(/\r?\n/)) {
    const parsed = parseLine(raw);
    if (!parsed) continue;

    if (parsed.type === 'section') {
      section = parsed.section;
      continue;
    }

    if (section === 'ignore' || section === 'maybe') continue;

    const card = {
      quantity: parsed.quantity,
      name: parsed.name,
      set: parsed.set,
      collectorNumber: parsed.collectorNumber,
      typeLine: '',
      manaCost: '',
      cmc: 0,
      imageUrl: null,
    };

    if (section === 'commander') {
      commanders.push(card);
    } else if (section === 'side') {
      sideboard.push(card);
    } else {
      // Some formats mark commanders inline with *CMDR*
      if (card.name.includes('*CMDR*')) {
        card.name = card.name.replace('*CMDR*', '').trim();
        commanders.push(card);
      } else {
        mainboard.push(card);
      }
    }
  }

  return { commanders, mainboard, sideboard };
}
