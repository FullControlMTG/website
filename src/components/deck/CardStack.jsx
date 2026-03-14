'use client';

const STRIP_HEIGHT = 52;

function CardItem({ card, index, total }) {
  const isLast = index === total - 1;
  const bottomClip = isLast ? '0%' : `calc(100% - ${STRIP_HEIGHT}px)`;

  return (
    <div
      className="group absolute left-0 right-0 transition-all duration-200"
      style={{
        top: index * STRIP_HEIGHT,
        zIndex: index,
        clipPath: `inset(0 0 ${bottomClip} 0 round 6px)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.clipPath = 'inset(0 0 0 0 round 6px)';
        e.currentTarget.style.zIndex = 100;
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.clipPath = `inset(0 0 ${bottomClip} 0 round 6px)`;
        e.currentTarget.style.zIndex = index;
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      {card.imageUrl ? (
        <img
          src={card.imageUrl}
          alt={card.name}
          className="w-full rounded-[6px] block"
          style={{ aspectRatio: '63 / 88' }}
          loading="lazy"
        />
      ) : (
        <div
          className="w-full rounded-[6px] bg-[#16213e] border border-white/10 flex items-end p-2"
          style={{ aspectRatio: '63 / 88' }}
        >
          <span className="text-xs text-slate-300 leading-tight">{card.name}</span>
        </div>
      )}

      {card.quantity > 1 && (
        <div className="absolute top-2 left-2 pointer-events-none">
          <span className="rounded-full bg-[#0d0d1a]/80 px-1.5 py-0.5 text-[10px] font-bold text-[#7dd3fc]">
            ×{card.quantity}
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-end p-2 bg-gradient-to-t from-black/80 to-transparent rounded-b-[6px] pointer-events-none">
        <span className="text-[10px] text-white leading-tight truncate">{card.name}</span>
      </div>
    </div>
  );
}

export default function CardStack({ cards, label }) {
  if (!cards?.length) return null;

  const totalHeight = (cards.length - 1) * STRIP_HEIGHT + 310;

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {label}{' '}
        <span className="text-slate-500 font-normal">
          ({cards.reduce((s, c) => s + c.quantity, 0)})
        </span>
      </h4>
      <div className="relative w-36" style={{ height: totalHeight }}>
        {cards.map((card, i) => (
          <CardItem key={`${card.name}-${i}`} card={card} index={i} total={cards.length} />
        ))}
      </div>
    </div>
  );
}
