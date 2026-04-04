import DeckSpread from './DeckSpread';
import CardFace from './CardFace';

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
                  <CardFace card={card} variant="commander" />
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
