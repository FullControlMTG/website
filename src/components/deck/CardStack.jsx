'use client';

// All sizing is driven by CSS custom properties defined in globals.css.
// --deck-card-w / --deck-card-h / --deck-strip-h change at each viewport breakpoint.
// 75% overlap → strip height = 25% of card height.

function scryfallHref(card) {
  if (card.set && card.collectorNumber) {
    return `https://scryfall.com/card/${card.set}/${card.collectorNumber}`;
  }
  return `https://scryfall.com/search?q=!${encodeURIComponent('"' + card.name + '"')}`;
}

function CardItem({ card, index, total }) {
  const isLast = index === total - 1;
  const defaultClip = isLast
    ? 'inset(0 0 0% 0 round 12px)'
    : 'inset(0 0 calc(var(--deck-card-h) - var(--deck-strip-h)) 0 round 12px)';

  return (
    <a
      href={scryfallHref(card)}
      target="_blank"
      rel="noopener noreferrer"
      title={card.name}
      className="absolute left-0 right-0 transition-all duration-200"
      style={{
        top: `calc(${index} * var(--deck-strip-h))`,
        zIndex: index,
        clipPath: defaultClip,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.clipPath = 'inset(0 0 0% 0 round 12px)';
        e.currentTarget.style.zIndex = 100;
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.clipPath = defaultClip;
        e.currentTarget.style.zIndex = index;
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      {card.imageUrl ? (
        <img
          src={card.imageUrl}
          alt={card.name}
          className="w-full rounded-[12px] block"
          style={{ aspectRatio: '63 / 88' }}
          loading="lazy"
        />
      ) : (
        <div
          className="w-full rounded-[12px] bg-[#16213e] border border-white/10 flex items-end p-2"
          style={{ aspectRatio: '63 / 88' }}
        >
          <span className="text-[10px] text-slate-300 leading-tight">{card.name}</span>
        </div>
      )}
    </a>
  );
}

/**
 * Renders an array of cards as a stacked column at 75% overlap.
 * Each card links to its Scryfall page.
 */
export default function CardStack({ cards }) {
  if (!cards?.length) return null;

  return (
    <div
      className="relative flex-shrink-0"
      style={{
        width: 'var(--deck-card-w)',
        height: `calc(var(--deck-card-h) + ${cards.length - 1} * var(--deck-strip-h))`,
      }}
    >
      {cards.map((card, i) => (
        <CardItem key={`${card.name}-${i}`} card={card} index={i} total={cards.length} />
      ))}
    </div>
  );
}
