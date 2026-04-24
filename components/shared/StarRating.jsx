'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Interactive and display-only star rating component.
 *
 * @param {Object}   props
 * @param {number}   props.value        — current rating (1–5)
 * @param {function} [props.onChange]   — called with new rating; omit for display-only
 * @param {number}   [props.max=5]      — total stars
 * @param {string}   [props.className]
 */
export default function StarRating({ value = 0, onChange, max = 5, className }) {
  const [hovered, setHovered] = useState(0);
  const interactive = typeof onChange === 'function';
  const display = hovered || value;

  return (
    <div
      className={cn('flex gap-1', className)}
      role={interactive ? 'radiogroup' : undefined}
      aria-label="Star rating"
    >
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1;
        const filled = star <= display;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            aria-pressed={star === value}
            className={cn(
              'text-4xl leading-none transition-transform select-none',
              interactive && 'cursor-pointer hover:scale-110 active:scale-95',
              !interactive && 'cursor-default'
            )}
            style={{ filter: filled ? 'none' : 'grayscale(1) opacity(0.35)' }}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onChange(star)}
          >
            ⭐
          </button>
        );
      })}
    </div>
  );
}
