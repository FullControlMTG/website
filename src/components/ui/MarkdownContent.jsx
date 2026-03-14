'use client';

import { useState, useRef, useCallback } from 'react';

export default function MarkdownContent({ html, className }) {
  const [card, setCard] = useState(null); // { name, x, y }
  const frameRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const span = e.target.closest('[data-card]');
    if (!span) {
      if (card) setCard(null);
      return;
    }
    const name = span.dataset.card;
    // Offset slightly so the tooltip doesn't sit under the cursor
    const x = e.clientX + 20;
    const y = e.clientY + 20;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => setCard({ name, x, y }));
  }, [card]);

  const handleMouseLeave = useCallback(() => setCard(null), []);

  // Clamp tooltip to viewport
  const tooltipWidth = 200;
  const tooltipHeight = 280;
  const safeX = card ? Math.min(card.x, (typeof window !== 'undefined' ? window.innerWidth : 1200) - tooltipWidth - 12) : 0;
  const safeY = card ? Math.min(card.y, (typeof window !== 'undefined' ? window.innerHeight : 800) - tooltipHeight - 12) : 0;

  return (
    <>
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {card && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{ left: safeX, top: safeY }}
        >
          <img
            src={`https://api.scryfall.com/cards/named?format=image&version=normal&fuzzy=${encodeURIComponent(card.name)}`}
            alt={card.name}
            className="rounded-xl shadow-2xl border border-white/20"
            style={{ width: tooltipWidth }}
          />
        </div>
      )}
    </>
  );
}
