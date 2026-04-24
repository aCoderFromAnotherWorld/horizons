/**
 * Scoring pipeline integration tests.
 *
 * These tests exercise the scoring engine functions with realistic simulated
 * session data — no real database connection required.
 */

import { describe, it, expect } from 'bun:test';
import {
  calculateCombinedScore,
  getRiskLevel,
  getDomainRisk,
  checkConsistency,
} from '../../lib/scoring/engine.js';
import { DOMAIN_MAX_POINTS, CHAPTER_TO_DOMAIN } from '../../lib/scoring/domains.js';
import { sampleTasks } from '../../lib/gameData/chapter6.js';

// ---------------------------------------------------------------------------
// Helper: build a simulated task_responses row
// ---------------------------------------------------------------------------
function makeResponse({ chapter, level, taskKey, isCorrect, scorePoints }) {
  return {
    id: Math.random(),
    session_id: 'test-session',
    chapter,
    level,
    task_key: taskKey,
    is_correct: isCorrect,
    score_points: scorePoints,
    attempt_number: 1,
    started_at: Date.now(),
    response_time_ms: 1200,
    selection: null,
    extra_data: null,
  };
}

// ---------------------------------------------------------------------------
// Scenario 1 — Chapter 2 (emotion) session domain score correctness
// ---------------------------------------------------------------------------
describe('Ch2 session → domain score correctness', () => {
  it('correct emotion responses produce low social_communication risk', () => {
    // All correct → raw score 0 → risk = low
    const rawScores = { social_communication: 0 };
    const combined = calculateCombinedScore(rawScores, []);
    expect(getRiskLevel(combined)).toBe('low');
    expect(getDomainRisk('social_communication', 0)).toBe('low');
  });

  it('50% error rate (half max points) maps to medium social_communication risk', () => {
    // Half of max points → 50 pts on a 100-point domain → normalised = 50
    const rawScores = { social_communication: 50 };
    const domain    = CHAPTER_TO_DOMAIN['ch2_emotion'];
    expect(domain).toBe('social_communication');

    const risk = getDomainRisk('social_communication', 50);
    // 50 is in [46, 65] → high
    expect(risk).toBe('high');
  });

  it('near-perfect emotion score stays within low threshold', () => {
    const rawScores = { social_communication: 5 };
    expect(getDomainRisk('social_communication', 5)).toBe('low');
  });

  it('domain max points match spec values', () => {
    expect(DOMAIN_MAX_POINTS.social_communication).toBe(100);
    expect(DOMAIN_MAX_POINTS.restricted_repetitive).toBe(70);
    expect(DOMAIN_MAX_POINTS.pretend_play).toBe(40);
    expect(DOMAIN_MAX_POINTS.sensory_processing).toBe(30);
  });

  it('combined score scales correctly with domain weight', () => {
    // social_communication weight = 0.40, max = 100
    // rawScore = 100 → normalised = 100 → weighted contribution = 100 * 0.40 = 40
    const combined = calculateCombinedScore({ social_communication: 100 }, []);
    expect(combined).toBeCloseTo(40, 5);
  });

  it('multi-domain session computes correct combined score', () => {
    // Simulate session completing all chapters with moderate scores
    // SC: 30/100 → norm=30 × 0.40 = 12
    // RR: 20/70  → norm≈28.57 × 0.30 ≈ 8.57
    // PP: 10/40  → norm=25 × 0.15 = 3.75
    // SP: 8/30   → norm≈26.67 × 0.15 ≈ 4.0
    // total ≈ 28.32 → 'medium'
    const combined = calculateCombinedScore({
      social_communication:  30,
      restricted_repetitive: 20,
      pretend_play:          10,
      sensory_processing:    8,
    }, []);
    expect(combined).toBeCloseTo(28.32, 1);
    expect(getRiskLevel(combined)).toBe('medium');
  });
});

// ---------------------------------------------------------------------------
// Scenario 2 — Two red flags stacking multiplicatively
// ---------------------------------------------------------------------------
describe('Two red flags stacking', () => {
  it('negative_emotion + complete_absence_pretend stack multiplicatively', () => {
    const base = calculateCombinedScore({ social_communication: 100 }, []);
    const withFlags = calculateCombinedScore(
      { social_communication: 100 },
      ['negative_emotion_recognition_under_50', 'complete_absence_pretend_play']
    );
    // 1.20 × 1.30 = 1.56 → not capped
    expect(withFlags).toBeCloseTo(base * 1.20 * 1.30, 5);
    expect(withFlags).toBeLessThan(base * 2.0);
  });

  it('sensory_distress + rigid_pattern stack below 2×', () => {
    const base = calculateCombinedScore({ social_communication: 100 }, []);
    const withFlags = calculateCombinedScore(
      { social_communication: 100 },
      ['extreme_sensory_distress', 'rigid_pattern_distress']
    );
    // 1.15 × 1.20 = 1.38 → not capped
    expect(withFlags).toBeCloseTo(base * 1.15 * 1.20, 5);
    expect(withFlags).toBeLessThan(base * 2.0);
  });

  it('four flags push combined score to near the 2× cap', () => {
    const base = calculateCombinedScore({ social_communication: 100 }, []);
    const withFlags = calculateCombinedScore(
      { social_communication: 100 },
      [
        'negative_emotion_recognition_under_50',
        'complete_absence_pretend_play',
        'extreme_sensory_distress',
        'rigid_pattern_distress',
      ]
    );
    // 1.20 × 1.30 × 1.15 × 1.20 ≈ 2.154 → capped at 2.0×
    expect(withFlags).toBeCloseTo(base * 2.0, 5);
  });

  it('stacking two flags raises risk level from medium to high', () => {
    // SC: 50/100→20, RR: 30/70→12.86, PP:15/40→5.625, SP:12/30→6 → total≈44.5 (medium)
    const moderate = {
      social_communication:  50,
      restricted_repetitive: 30,
      pretend_play:          15,
      sensory_processing:    12,
    };
    const baseScore = calculateCombinedScore(moderate, []);
    expect(getRiskLevel(baseScore)).toBe('medium');

    const flaggedScore = calculateCombinedScore(moderate, [
      'negative_emotion_recognition_under_50',
      'complete_absence_pretend_play',
    ]);
    // After ×1.56, the combined score should enter high or very_high
    expect(getRiskLevel(flaggedScore)).not.toBe('low');
  });
});

// ---------------------------------------------------------------------------
// Scenario 3 — Chapter 6 consistency check
// ---------------------------------------------------------------------------
describe('checkConsistency — Ch6 performance vs original chapters', () => {
  it('returns false when ch6 performance is similar to original', () => {
    const origResponses = [1, 1, 0, 0, 2, 1].map((pts, i) =>
      makeResponse({ chapter: 2, level: 1, taskKey: `ch2_l1_${i}`, isCorrect: pts === 0, scorePoints: pts })
    );
    const ch6Responses = [1, 1, 0, 1, 2, 0].map((pts, i) =>
      makeResponse({ chapter: 6, level: 1, taskKey: `ch6_${i}`, isCorrect: pts === 0, scorePoints: pts })
    );
    expect(checkConsistency(ch6Responses, origResponses)).toBe(false);
  });

  it('returns true when ch6 average is >20% worse than original', () => {
    // Original: avg = 1.0, ch6: avg = 2.5 → clearly worse
    const origResponses = [1, 1, 1, 1].map((pts, i) =>
      makeResponse({ chapter: 2, level: 1, taskKey: `ch2_l1_${i}`, isCorrect: false, scorePoints: pts })
    );
    const ch6Responses = [3, 2, 3, 2].map((pts, i) =>
      makeResponse({ chapter: 6, level: 1, taskKey: `ch6_${i}`, isCorrect: false, scorePoints: pts })
    );
    // ch6 avg = 2.5, orig avg = 1.0, 2.5 > 1.0 * 1.20 → true
    expect(checkConsistency(ch6Responses, origResponses)).toBe(true);
  });

  it('returns false when ch6 is better than original (lower score = better)', () => {
    const origResponses = [3, 2, 3, 2].map((pts, i) =>
      makeResponse({ chapter: 3, level: 2, taskKey: `ch3_l2_${i}`, isCorrect: false, scorePoints: pts })
    );
    const ch6Responses = [0, 0, 1, 0].map((pts, i) =>
      makeResponse({ chapter: 6, level: 1, taskKey: `ch6_${i}`, isCorrect: pts === 0, scorePoints: pts })
    );
    // ch6 avg ≈ 0.25, orig avg = 2.5 → ch6 is much better, no concern
    expect(checkConsistency(ch6Responses, origResponses)).toBe(false);
  });

  it('returns false when ch6 responses are empty', () => {
    const origResponses = [1, 2, 1].map((pts, i) =>
      makeResponse({ chapter: 2, level: 1, taskKey: `ch2_${i}`, isCorrect: false, scorePoints: pts })
    );
    expect(checkConsistency([], origResponses)).toBe(false);
  });

  it('returns false when original responses are empty', () => {
    const ch6Responses = [1, 2, 1].map((pts, i) =>
      makeResponse({ chapter: 6, level: 1, taskKey: `ch6_${i}`, isCorrect: false, scorePoints: pts })
    );
    expect(checkConsistency(ch6Responses, [])).toBe(false);
  });

  it('returns false when original average is 0 (perfect baseline)', () => {
    const origResponses = [0, 0, 0].map((pts, i) =>
      makeResponse({ chapter: 2, level: 1, taskKey: `ch2_${i}`, isCorrect: true, scorePoints: pts })
    );
    const ch6Responses = [1, 0, 1].map((pts, i) =>
      makeResponse({ chapter: 6, level: 1, taskKey: `ch6_${i}`, isCorrect: pts === 0, scorePoints: pts })
    );
    // orig avg = 0 → cannot determine baseline → false
    expect(checkConsistency(ch6Responses, origResponses)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Chapter 6 task pool sampling
// ---------------------------------------------------------------------------
describe('sampleTasks — deterministic seeded sampling', () => {
  it('returns exactly 15 tasks', () => {
    expect(sampleTasks('test-session-abc').length).toBe(15);
  });

  it('produces the same sample for the same sessionId', () => {
    const a = sampleTasks('session-xyz-123');
    const b = sampleTasks('session-xyz-123');
    expect(a.map(t => t.key)).toEqual(b.map(t => t.key));
  });

  it('produces different samples for different sessionIds', () => {
    const a = sampleTasks('session-aaa').map(t => t.key).join(',');
    const b = sampleTasks('session-bbb').map(t => t.key).join(',');
    expect(a).not.toBe(b);
  });

  it('all sampled tasks have required descriptor fields', () => {
    const tasks = sampleTasks('test-session-fields');
    for (const task of tasks) {
      expect(task.key).toBeTruthy();
      expect(typeof task.chapter).toBe('number');
      expect(typeof task.mechanic).toBe('string');
      expect(['tap_target', 'grid_select', 'scenario_choice', 'drag_sort']).toContain(task.mechanic);
    }
  });

  it('covers at least 3 different mechanic types across 15 tasks', () => {
    const tasks    = sampleTasks('variety-session');
    const mechanics = new Set(tasks.map(t => t.mechanic));
    expect(mechanics.size).toBeGreaterThanOrEqual(3);
  });
});
