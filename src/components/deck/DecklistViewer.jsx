import CardStack from './CardStack';

const TYPE_ORDER = [
  'Creature',
  'Instant',
  'Sorcery',
  'Artifact',
  'Enchantment',
  'Planeswalker',
  'Land',
  'Other',
];

function getTypeGroup(typeLine) {
  for (const t of TYPE_ORDER.slice(0, -1)) {
    if (typeLine.includes(t)) return t;
  }
  return 'Other';
}

function groupByType(cards) {
  const groups = {};
  for (const card of cards) {
    const group = getTypeGroup(card.typeLine);
    if (!groups[group]) groups[group] = [];
    groups[group].push(card);
  }
  return TYPE_ORDER.filter((t) => groups[t]?.length).map((t) => ({ label: `${t}s`, cards: groups[t] }));
}

export default function DecklistViewer({ decklist }) {
  if (!decklist) return null;

  const { commanders = [], mainboard = [], sideboard = [] } = decklist;
  const typeGroups = groupByType(mainboard);

  return (
    <div className="space-y-10">
      {commanders.length > 0 && (
        <section>
          <h3 className="font-display text-base font-semibold text-[#7dd3fc] mb-5">
            Commander{commanders.length > 1 ? 's' : ''}
          </h3>
          <div className="flex flex-wrap gap-6">
            {commanders.map((card) => (
              <div key={card.name} className="flex flex-col gap-2">
                <div className="w-40">
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="w-full rounded-lg shadow-lg"
                      style={{ aspectRatio: '63 / 88' }}
                    />
                  ) : (
                    <div
                      className="w-full rounded-lg bg-[#16213e] border border-white/10 flex items-center justify-center p-3"
                      style={{ aspectRatio: '63 / 88' }}
                    >
                      <span className="text-xs text-slate-300 text-center">{card.name}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-400 text-center w-40">{card.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {typeGroups.length > 0 && (
        <section>
          <h3 className="font-display text-base font-semibold text-[#7dd3fc] mb-5">
            Mainboard <span className="text-slate-500 font-normal text-sm">({mainboard.reduce((s, c) => s + c.quantity, 0)} cards)</span>
          </h3>
          <div className="flex flex-wrap gap-8 items-start">
            {typeGroups.map(({ label, cards }) => (
              <CardStack key={label} label={label} cards={cards} />
            ))}
          </div>
        </section>
      )}

      {sideboard.length > 0 && (
        <section>
          <h3 className="font-display text-base font-semibold text-[#7dd3fc] mb-5">
            Sideboard <span className="text-slate-500 font-normal text-sm">({sideboard.reduce((s, c) => s + c.quantity, 0)} cards)</span>
          </h3>
          <div className="flex flex-wrap gap-8 items-start">
            {groupByType(sideboard).map(({ label, cards }) => (
              <CardStack key={label} label={label} cards={cards} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
