import DeckSpread from './DeckSpread';

/** Expand each card entry into N individual single-card slots. */
function expandAll(cards) {
  const result = [];
  for (const card of cards) {
    for (let i = 0; i < card.quantity; i++) {
      result.push({ ...card, quantity: 1, _copy: i });
    }
  }
  return result;
}

export default function DecklistViewer({ decklist }) {
  if (!decklist) return null;

  const { commanders = [], mainboard = [], sideboard = [] } = decklist;
  const mainTotal = mainboard.reduce((s, c) => s + c.quantity, 0);
  const sideTotal = sideboard.reduce((s, c) => s + c.quantity, 0);

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
                <div style={{ width: 'var(--deck-card-w)' }}>
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
                <span
                  className="text-xs text-slate-400 text-center"
                  style={{ width: 'var(--deck-card-w)' }}
                >
                  {card.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {mainboard.length > 0 && (
        <section>
          <h3 className="font-display text-base font-semibold text-[#7dd3fc] mb-5">
            Mainboard{' '}
            <span className="text-slate-500 font-normal text-sm">({mainTotal} cards)</span>
          </h3>
          <DeckSpread cards={expandAll(mainboard)} />
        </section>
      )}

      {sideboard.length > 0 && (
        <section>
          <h3 className="font-display text-base font-semibold text-[#7dd3fc] mb-5">
            Sideboard{' '}
            <span className="text-slate-500 font-normal text-sm">({sideTotal} cards)</span>
          </h3>
          <DeckSpread cards={expandAll(sideboard)} />
        </section>
      )}
    </div>
  );
}
