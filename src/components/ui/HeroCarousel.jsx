'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const INTERVAL_MS = 6000;
const SWIPE_THRESHOLD_PX = 50;

export default function HeroCarousel({ slides }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);

  const count = slides.length;
  const go = (step) => setCurrent((c) => (c + step + count) % count);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setTimeout(() => setCurrent((c) => (c + 1) % count), INTERVAL_MS);
    return () => clearTimeout(id);
  }, [current, count, paused]);

  if (!count) return null;

  const slide = slides[current];
  const isExternal = slide.href?.startsWith('http');

  const ctaProps = isExternal
    ? { href: slide.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: slide.href };

  const CTA = isExternal ? 'a' : Link;

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD_PX) go(dx < 0 ? 1 : -1);
  };

  return (
    <section
      className="relative h-[min(75svh,620px)] min-h-[440px] overflow-hidden bg-[#1a1a2e]"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slide.image && (
        <div
          key={slide.image}
          className="absolute inset-0 bg-cover bg-center animate-[heroFade_700ms_ease-out]"
          style={{ backgroundImage: `url(${slide.image})` }}
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/80 to-[#0d0d1a]/30 md:bg-gradient-to-r md:from-[#0d0d1a]/95 md:via-[#0d0d1a]/70 md:to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d0d1a] to-transparent" />

      <div className="relative mx-auto flex h-full max-w-7xl items-end px-6 pb-16 md:items-center md:px-16 md:pb-0">
        <div key={current} className="max-w-xl animate-[heroRise_500ms_ease-out]">
          {slide.tag && (
            <span className="inline-block mb-3 rounded-full bg-[#e94560]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#e94560]">
              {slide.tag}
            </span>
          )}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-3 md:mb-4">
            {slide.title}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg mb-6 leading-relaxed line-clamp-3">
            {slide.description}
          </p>
          <CTA
            {...ctaProps}
            className="inline-block rounded-lg bg-[#e94560] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c73652] transition-colors"
          >
            {slide.cta ?? 'View Now'}
          </CTA>
        </div>
      </div>

      {count > 1 && (
        <div className="absolute bottom-6 inset-x-0 flex flex-wrap justify-center gap-1.5 px-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? 'w-6 bg-[#7dd3fc]' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current}
            />
          ))}
        </div>
      )}

      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:block rounded-full bg-black/40 p-2 text-white hover:bg-black/70 transition-colors"
            aria-label="Previous"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block rounded-full bg-black/40 p-2 text-white hover:bg-black/70 transition-colors"
            aria-label="Next"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}
