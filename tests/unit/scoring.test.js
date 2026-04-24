import { describe, it, expect } from 'bun:test';
import {
  calculateCombinedScore,
  getRiskLevel,
  getDomainRisk,
  calcGameAccuracy,
  calcAvgAttempts,
} from '../../lib/scoring/engine.js';
import { RED_FLAG_MULTIPLIERS } from '../../lib/scoring/redFlags.js';
import { COMBINED_THRESHOLDS, DOMAIN_THRESHOLDS } from '../../lib/scoring/thresholds.js';

// ---------------------------------------------------------------------------
// calculateCombinedScore
// ---------------------------------------------------------------------------
describe('calculateCombinedScore', () => {
  it('returns 0 when all domain scores are 0', () => {
    const result = calculateCombinedScore(
      { social_communication: 0, restricted_repetitive: 0, pretend_play: 0, sensory_processing: 0 },
      []
    );
    expect(result).toBe(0);
  });

  it('calculates weighted sum without multipliers', () => {
    // social_communication max=100, weight=0.40 → 50/100 * 100 * 0.40 = 20
    // restricted_repetitive max=70, weight=0.30  → 35/70  * 100 * 0.30 = 15
    // pretend_play max=40, weight=0.15           → 20/40  * 100 * 0.15 = 7.5
    // sensory_processing max=30, weight=0.15     → 15/30  * 100 * 0.15 = 7.5
    // total = 50
    const result = calculateCombinedScore(
      {
        social_communication:  50,
        restricted_repetitive: 35,
        pretend_play:          20,
        sensory_processing:    15,
      },
      []
    );
    expect(result).toBeCloseTo(50, 5);
  });

  it('applies a single red flag multiplier', () => {
    // 100% of max in social_communication only → 0.40 * 100 = 40 base
    // × 1.20 (negative_emotion_recognition_under_50) = 48
    const result = calculateCombinedScore(
      { social_communication: 100 },
      ['negative_emotion_recognition_under_50']
    );
    expect(result).toBeCloseTo(40 * 1.20, 5);
  });

  it('stacks two multipliers multiplicatively', () => {
    // base = 40 (same as above), × 1.20 × 1.30 = 62.4
    const result = calculateCombinedScore(
      { social_communication: 100 },
      ['negative_emotion_recognition_under_50', 'complete_absence_pretend_play']
    );
    expect(result).toBeCloseTo(40 * 1.20 * 1.30, 5);
  });

  it('caps stacked multipliers at 2.0×', () => {
    // All five flags: 1.20 × 1.30 × 1.15 × 1.20 × 1.25 ≈ 3.38 → capped at 2.0
    const allFlags = Object.keys(RED_FLAG_MULTIPLIERS);
    const baseScore = calculateCombinedScore({ social_communication: 100 }, []);
    const capped    = calculateCombinedScore({ social_communication: 100 }, allFlags);
    expect(capped).toBeCloseTo(baseScore * 2.0, 5);
  });

  it('missing domain keys default to 0', () => {
    const result = calculateCombinedScore({}, []);
    expect(result).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getRiskLevel — test every threshold boundary
// ---------------------------------------------------------------------------
describe('getRiskLevel', () => {
  it('returns low for score 0', ()   => expect(getRiskLevel(0)).toBe('low'));
  it('returns low for score 25', ()  => expect(getRiskLevel(25)).toBe('low'));
  it('returns medium for score 26',  () => expect(getRiskLevel(26)).toBe('medium'));
  it('returns medium for score 45',  () => expect(getRiskLevel(45)).toBe('medium'));
  it('returns high for score 46',    () => expect(getRiskLevel(46)).toBe('high'));
  it('returns high for score 65',    () => expect(getRiskLevel(65)).toBe('high'));
  it('returns very_high for score 66',  () => expect(getRiskLevel(66)).toBe('very_high'));
  it('returns very_high for score 200', () => expect(getRiskLevel(200)).toBe('very_high'));
});

// ---------------------------------------------------------------------------
// getDomainRisk — spot-check each domain at its boundaries
// ---------------------------------------------------------------------------
describe('getDomainRisk', () => {
  it('social_communication: 20 → low',       () => expect(getDomainRisk('social_communication',  20)).toBe('low'));
  it('social_communication: 21 → medium',    () => expect(getDomainRisk('social_communication',  21)).toBe('medium'));
  it('social_communication: 45 → medium',    () => expect(getDomainRisk('social_communication',  45)).toBe('medium'));
  it('social_communication: 46 → high',      () => expect(getDomainRisk('social_communication',  46)).toBe('high'));
  it('social_communication: 65 → high',      () => expect(getDomainRisk('social_communication',  65)).toBe('high'));
  it('social_communication: 66 → very_high', () => expect(getDomainRisk('social_communication',  66)).toBe('very_high'));

  it('restricted_repetitive: 15 → low',      () => expect(getDomainRisk('restricted_repetitive', 15)).toBe('low'));
  it('restricted_repetitive: 16 → medium',   () => expect(getDomainRisk('restricted_repetitive', 16)).toBe('medium'));
  it('restricted_repetitive: 30 → medium',   () => expect(getDomainRisk('restricted_repetitive', 30)).toBe('medium'));
  it('restricted_repetitive: 31 → high',     () => expect(getDomainRisk('restricted_repetitive', 31)).toBe('high'));

  it('pretend_play: 10 → low',   () => expect(getDomainRisk('pretend_play', 10)).toBe('low'));
  it('pretend_play: 11 → medium',() => expect(getDomainRisk('pretend_play', 11)).toBe('medium'));
  it('pretend_play: 20 → medium',() => expect(getDomainRisk('pretend_play', 20)).toBe('medium'));
  it('pretend_play: 21 → high',  () => expect(getDomainRisk('pretend_play', 21)).toBe('high'));

  it('sensory_processing: 8  → low',    () => expect(getDomainRisk('sensory_processing',  8)).toBe('low'));
  it('sensory_processing: 9  → medium', () => expect(getDomainRisk('sensory_processing',  9)).toBe('medium'));
  it('sensory_processing: 15 → medium', () => expect(getDomainRisk('sensory_processing', 15)).toBe('medium'));
  it('sensory_processing: 16 → high',   () => expect(getDomainRisk('sensory_processing', 16)).toBe('high'));

  it('unknown domain → unknown', () => expect(getDomainRisk('nonexistent', 50)).toBe('unknown'));
});

// ---------------------------------------------------------------------------
// All 5 red flag multipliers individually
// ---------------------------------------------------------------------------
describe('RED_FLAG_MULTIPLIERS values', () => {
  it('negative_emotion_recognition_under_50 = 1.20',
    () => expect(RED_FLAG_MULTIPLIERS.negative_emotion_recognition_under_50).toBe(1.20));
  it('complete_absence_pretend_play = 1.30',
    () => expect(RED_FLAG_MULTIPLIERS.complete_absence_pretend_play).toBe(1.30));
  it('extreme_sensory_distress = 1.15',
    () => expect(RED_FLAG_MULTIPLIERS.extreme_sensory_distress).toBe(1.15));
  it('rigid_pattern_distress = 1.20',
    () => expect(RED_FLAG_MULTIPLIERS.rigid_pattern_distress).toBe(1.20));
  it('poor_imitation_all_modalities = 1.25',
    () => expect(RED_FLAG_MULTIPLIERS.poor_imitation_all_modalities).toBe(1.25));
});

describe('red flag stacking and 2× cap', () => {
  it('two flags stack multiplicatively', () => {
    const base = calculateCombinedScore({ social_communication: 100 }, []);
    const twoFlags = calculateCombinedScore(
      { social_communication: 100 },
      ['extreme_sensory_distress', 'rigid_pattern_distress']
    );
    expect(twoFlags).toBeCloseTo(base * 1.15 * 1.20, 5);
  });

  it('all five flags capped at 2.0×', () => {
    const base = calculateCombinedScore({ social_communication: 100 }, []);
    const allCapped = calculateCombinedScore(
      { social_communication: 100 },
      Object.keys(RED_FLAG_MULTIPLIERS)
    );
    // Raw product ≈ 3.38× → clamped to 2.0×
    expect(allCapped).toBeCloseTo(base * 2.0, 5);
  });

  it('three flags below 2× threshold are NOT capped', () => {
    // 1.15 × 1.20 × 1.20 = 1.6560 < 2.0 → no cap
    const base = calculateCombinedScore({ social_communication: 100 }, []);
    const three = calculateCombinedScore(
      { social_communication: 100 },
      ['extreme_sensory_distress', 'rigid_pattern_distress', 'negative_emotion_recognition_under_50']
    );
    const expected = base * 1.15 * 1.20 * 1.20;
    expect(three).toBeCloseTo(expected, 5);
    expect(three).toBeLessThan(base * 2.0);
  });
});

// ---------------------------------------------------------------------------
// calcGameAccuracy & calcAvgAttempts edge cases
// ---------------------------------------------------------------------------
describe('calcGameAccuracy', () => {
  it('returns 0 for 0 total moves', () => expect(calcGameAccuracy(0, 0)).toBe(0));
  it('returns 1.0 for perfect accuracy',   () => expect(calcGameAccuracy(10, 10)).toBe(1.0));
  it('returns 0.5 for half correct',       () => expect(calcGameAccuracy(5, 10)).toBeCloseTo(0.5));
  it('returns 0 correct with moves',       () => expect(calcGameAccuracy(0, 5)).toBe(0));
});

describe('calcAvgAttempts', () => {
  it('returns 0 for 0 questions', () => expect(calcAvgAttempts(0, 0)).toBe(0));
  it('returns average correctly', () => expect(calcAvgAttempts(15, 5)).toBeCloseTo(3.0));
  it('handles non-integer result', () => expect(calcAvgAttempts(7, 3)).toBeCloseTo(7/3));
});
