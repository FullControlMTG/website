'use client';

import { useRef, useState, useEffect } from 'react';
import CardStack from './CardStack';

const MIN_CARD_W = 120; // minimum readable card width in px
const MAX_COLS = 4;
const OVERLAP = 0.85;   // 85% overlap → 15% strip visible

function computeDims(containerW) {
  const cols = Math.min(MAX_COLS, Math.max(1, Math.floor(containerW / MIN_CARD_W)));
  const cardW = containerW / cols;
  const cardH = cardW * (88 / 63);
  const stripH = cardH * (1 - OVERLAP);
  return { cols, cardW, cardH, stripH };
}

export default function DeckSpread({ cards }) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState(null); // null until measured

  useEffect(() => {
    function update() {
      if (!containerRef.current) return;
      setDims(computeDims(containerRef.current.offsetWidth));
    }

    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const columns = [];
  if (dims) {
    const cardsPerCol = Math.ceil(cards.length / dims.cols);
    for (let c = 0; c < dims.cols; c++) {
      const slice = cards.slice(c * cardsPerCol, (c + 1) * cardsPerCol);
      if (slice.length > 0) columns.push(slice);
    }
  }

  const cssVars = dims
    ? {
        '--deck-card-w': `${dims.cardW}px`,
        '--deck-card-h': `${dims.cardH}px`,
        '--deck-strip-h': `${dims.stripH}px`,
      }
    : {};

  return (
    <div
      ref={containerRef}
      className="flex items-start w-full"
      style={cssVars}
    >
      {dims &&
        columns.map((colCards, ci) => (
          <CardStack key={ci} cards={colCards} />
        ))}
    </div>
  );
}
