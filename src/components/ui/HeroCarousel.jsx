import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

export default function HeroCarousel({ slides }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next, slides.length]);

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <div className="relative h-[500px] overflow-hidden bg-[#1a1a2e]">
      {slide.image && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d1a]/90 via-[#0d0d1a]/60 to-transparent" />
        </div>
      )}

      <div className="relative flex h-full items-center px-8 md:px-16 max-w-7xl mx-auto">
        <div className="max-w-xl">
          {slide.tag && (
            <span className="inline-block mb-3 rounded-full bg-[#e94560]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#e94560]">
              {slide.tag}
            </span>
          )}
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            {slide.title}
          </h1>
          <p className="text-slate-300 text-base md:text-lg mb-6 leading-relaxed">
            {slide.description}
          </p>
          <Link
            to={slide.href}
            className="inline-block rounded-lg bg-[#e94560] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c73652] transition-colors"
          >
            {slide.cta ?? 'View Now'}
          </Link>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? 'w-8 bg-[#7dd3fc]' : 'w-2 bg-white/40'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/70 transition-colors"
            aria-label="Previous"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/70 transition-colors"
            aria-label="Next"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
