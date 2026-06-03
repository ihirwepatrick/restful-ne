'use client';

import { useEffect, useState } from 'react';
import { AUTH_IMAGES, AUTH_IMAGE_INTERVAL_MS } from '@/lib/auth-images';
import ProgressiveBlur from '@/components/ProgressiveBlur';

export default function AuthImageCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (AUTH_IMAGES.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % AUTH_IMAGES.length);
    }, AUTH_IMAGE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-zinc-900">
      {AUTH_IMAGES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className={`h-full w-full object-cover ${i === index ? 'animate-[authKenBurns_12s_ease-in-out_infinite_alternate]' : ''}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>
      ))}

      <ProgressiveBlur position="top" backgroundColor="var(--auth-blur-bg)" height="180px" blurAmount="6px" />
      <ProgressiveBlur position="bottom" backgroundColor="var(--auth-blur-bg)" height="280px" blurAmount="10px" />

      {/* Opaque bottom scrim — stronger in light mode so text stays readable */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[25] h-[72%] max-h-80"
        style={{
          background:
            'linear-gradient(to top, var(--auth-carousel-scrim) 0%, var(--auth-carousel-scrim) 55%, transparent 100%)',
        }}
      />

      {/* Bottom-left content above the bottom blur */}
      <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-start justify-end px-8 pb-10 text-left pointer-events-none">
        <div
          className="max-w-md space-y-3 rounded-2xl px-4 py-4 backdrop-blur-md"
          style={{ backgroundColor: 'var(--auth-carousel-panel)' }}
        >
          <p className="auth-carousel-kicker text-xs font-semibold uppercase tracking-widest">
            TZW Fire Safety
          </p>
          <p className="auth-carousel-title text-2xl font-bold leading-snug">
            Protecting facilities with reliable extinguisher management
          </p>
          <p className="auth-carousel-subtitle text-sm font-medium">
            Inspections, maintenance, and compliance — all in one place.
          </p>
        </div>

        <div className="flex gap-2 mt-5 px-1 pointer-events-auto">
          {AUTH_IMAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show image ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`auth-carousel-dot h-1.5 rounded-full transition-all duration-150 hover:scale-110 ${i === index ? 'is-active' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
