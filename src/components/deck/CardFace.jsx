export default function CardFace({ card, variant = 'stacked' }) {
  const isCommander = variant === 'commander';
  const rounded = 'rounded-[12px]';
  const fallbackAlign = isCommander ? 'items-center justify-center p-3' : 'items-end p-2';
  const textStyle = isCommander ? 'text-xs text-center' : 'text-[10px] leading-tight';

  return card.imageUrl ? (
    <img
      src={card.imageUrl}
      alt={card.name}
      className={`w-full ${rounded} block`}
      style={{ aspectRatio: '63 / 88' }}
      loading="lazy"
    />
  ) : (
    <div
      className={`w-full ${rounded} bg-[#16213e] border border-white/10 flex ${fallbackAlign}`}
      style={{ aspectRatio: '63 / 88' }}
    >
      <span className={`${textStyle} text-slate-300`}>{card.name}</span>
    </div>
  );
}
