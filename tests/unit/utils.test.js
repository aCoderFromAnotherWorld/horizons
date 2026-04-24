import { describe, it, expect } from 'bun:test';
import { cn, formatTime, generateId } from '../../lib/utils.js';
import { calcGameAccuracy, calcAvgAttempts } from '../../lib/scoring/engine.js';

// ---------------------------------------------------------------------------
// cn() — Tailwind class merging
// ---------------------------------------------------------------------------
describe('cn()', () => {
  it('returns a single class string unchanged', () => {
    expect(cn('text-sm')).toBe('text-sm');
  });

  it('merges multiple class strings', () => {
    const result = cn('text-sm', 'font-bold');
    expect(result).toContain('text-sm');
    expect(result).toContain('font-bold');
  });

  it('deduplicates conflicting Tailwind classes (tailwind-merge)', () => {
    const result = cn('text-sm', 'text-lg');
    expect(result).not.toContain('text-sm');
    expect(result).toContain('text-lg');
  });

  it('handles conditional classes (falsy values ignored)', () => {
    const result = cn('text-sm', false && 'hidden', null, undefined, 'font-bold');
    expect(result).toContain('text-sm');
    expect(result).toContain('font-bold');
    expect(result).not.toContain('hidden');
  });

  it('handles array input', () => {
    const result = cn(['text-sm', 'font-bold']);
    expect(result).toContain('text-sm');
    expect(result).toContain('font-bold');
  });

  it('returns empty string when no classes provided', () => {
    expect(cn()).toBe('');
  });
});

// ---------------------------------------------------------------------------
// generateId() — UUID v4
// ---------------------------------------------------------------------------
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('generateId()', () => {
  it('returns a UUID v4 format string', () => {
    expect(generateId()).toMatch(UUID_V4_REGEX);
  });

  it('returns a different ID on each call', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it('returns a string of length 36', () => {
    expect(generateId()).toHaveLength(36);
  });
});

// ---------------------------------------------------------------------------
// formatTime() — human-readable duration
// ---------------------------------------------------------------------------
describe('formatTime()', () => {
  it('returns "0s" for 0 ms', () => {
    expect(formatTime(0)).toBe('0s');
  });

  it('returns "1s" for exactly 1000 ms', () => {
    expect(formatTime(1000)).toBe('1s');
  });

  it('returns "59s" for 59 seconds', () => {
    expect(formatTime(59000)).toBe('59s');
  });

  it('includes "m" and "s" for 65 000 ms (1 minute 5 seconds)', () => {
    const result = formatTime(65000);
    expect(result).toContain('m');
    expect(result).toContain('s');
    expect(result).toBe('1m 5s');
  });

  it('formats 90 seconds as "1m 30s"', () => {
    expect(formatTime(90000)).toBe('1m 30s');
  });

  it('formats exactly 60 seconds as "1m 0s"', () => {
    expect(formatTime(60000)).toBe('1m 0s');
  });

  it('truncates fractional seconds (floors to nearest second)', () => {
    expect(formatTime(1999)).toBe('1s');
    expect(formatTime(61999)).toBe('1m 1s');
  });
});

// ---------------------------------------------------------------------------
// calcGameAccuracy() — edge cases
// ---------------------------------------------------------------------------
describe('calcGameAccuracy()', () => {
  it('returns 0 when totalMoves is 0 (avoids division by zero)', () => {
    expect(calcGameAccuracy(0, 0)).toBe(0);
  });

  it('returns 0 when correctResponses is 0 and totalMoves is positive', () => {
    expect(calcGameAccuracy(0, 10)).toBe(0);
  });

  it('returns 1.0 for perfect accuracy', () => {
    expect(calcGameAccuracy(10, 10)).toBe(1.0);
  });

  it('returns 0.3 for 3 correct out of 10', () => {
    expect(calcGameAccuracy(3, 10)).toBeCloseTo(0.3);
  });

  it('returns 0.5 for half correct', () => {
    expect(calcGameAccuracy(5, 10)).toBeCloseTo(0.5);
  });

  it('handles large numbers correctly', () => {
    expect(calcGameAccuracy(750, 1000)).toBeCloseTo(0.75);
  });
});

// ---------------------------------------------------------------------------
// calcAvgAttempts() — edge cases
// ---------------------------------------------------------------------------
describe('calcAvgAttempts()', () => {
  it('returns 0 when totalQuestions is 0 (avoids division by zero)', () => {
    expect(calcAvgAttempts(0, 0)).toBe(0);
  });

  it('returns 3 for 15 attempts across 5 questions', () => {
    expect(calcAvgAttempts(15, 5)).toBeCloseTo(3.0);
  });

  it('returns 1.0 when each question required exactly 1 attempt', () => {
    expect(calcAvgAttempts(10, 10)).toBeCloseTo(1.0);
  });

  it('handles non-integer result', () => {
    expect(calcAvgAttempts(7, 3)).toBeCloseTo(7 / 3);
  });

  it('returns 0 when sum of attempts is 0', () => {
    expect(calcAvgAttempts(0, 5)).toBe(0);
  });
});
