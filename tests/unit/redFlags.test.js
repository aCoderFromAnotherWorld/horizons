import { describe, it, expect } from 'bun:test';
import { detectRedFlags, RED_FLAG_MULTIPLIERS } from '../../lib/scoring/redFlags.js';
import { calculateCombinedScore } from '../../lib/scoring/engine.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeTask(overrides) {
  return {
    id: Math.random(),
    session_id: 'test',
    chapter: 1,
    level: 1,
    task_key: 'test_task',
    is_correct: false,
    score_points: 1,
    attempt_number: 1,
    started_at: Date.now(),
    response_time_ms: 1000,
    selection: null,
    extra_data: null,
    ...overrides,
  };
}

function makeNegativeEmotionTasks(total, correctCount) {
  return Array.from({ length: total }, (_, i) =>
    makeTask({
      chapter: 2,
      level: 1,
      task_key: `ch2_l1_sad_${i}`,
      is_correct: i < correctCount,
    })
  );
}

function makePretendTasks(count, allLiteral = true) {
  return Array.from({ length: count }, (_, i) =>
    makeTask({
      chapter: 5,
      level: 1,
      task_key: `ch5_l1_pretend_${i}`,
      is_correct: allLiteral ? false : i === 0,
    })
  );
}

function makeSensoryTasks(distressingCount, totalCount = 6) {
  return Array.from({ length: totalCount }, (_, i) =>
    makeTask({
      chapter: 5,
      level: 3,
      task_key: `ch5_l3_sound_${i}`,
      is_correct: false,
      extra_data: {
        sub_scene: 'sounds',
        distressing: i < distressingCount,
      },
    })
  );
}

function makePatternTask(meltdown, returnsToPattern) {
  return makeTask({
    chapter: 4,
    level: 3,
    task_key: 'ch4_l3_pattern_1',
    extra_data: { meltdown, returns_to_pattern: returnsToPattern },
  });
}

function makeImitationTasks(errorCount) {
  return Array.from({ length: errorCount }, (_, i) =>
    makeTask({
      chapter: 3,
      level: 4,
      task_key: `ch3_l4_imitation_${i}`,
      is_correct: false,
    })
  );
}

// ---------------------------------------------------------------------------
// Flag 1: negative_emotion_recognition_under_50
// ---------------------------------------------------------------------------
describe('negative_emotion_recognition_under_50', () => {
  it('triggers when negative emotion accuracy is exactly 49% (< 50%)', () => {
    const tasks = makeNegativeEmotionTasks(100, 49);
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).toContain('negative_emotion_recognition_under_50');
  });

  it('does NOT trigger when accuracy is exactly 50%', () => {
    const tasks = makeNegativeEmotionTasks(2, 1);
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).not.toContain('negative_emotion_recognition_under_50');
  });

  it('does NOT trigger when accuracy is above 50%', () => {
    const tasks = makeNegativeEmotionTasks(10, 8);
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).not.toContain('negative_emotion_recognition_under_50');
  });

  it('triggers with minimal task set (1 out of 3 correct = 33%)', () => {
    const tasks = makeNegativeEmotionTasks(3, 1);
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).toContain('negative_emotion_recognition_under_50');
  });

  it('does NOT trigger when there are no negative emotion tasks', () => {
    const nonNegative = [
      makeTask({ chapter: 2, level: 1, task_key: 'ch2_l1_happy_1', is_correct: false }),
    ];
    const flags = detectRedFlags({ taskResponses: nonNegative });
    expect(flags).not.toContain('negative_emotion_recognition_under_50');
  });

  it('recognises "scared", "fear", and "angry" task keys as negative emotion', () => {
    const tasks = [
      makeTask({ chapter: 2, level: 1, task_key: 'ch2_l1_scared_1', is_correct: false }),
      makeTask({ chapter: 2, level: 1, task_key: 'ch2_l1_fear_1',   is_correct: false }),
      makeTask({ chapter: 2, level: 1, task_key: 'ch2_l1_angry_1',  is_correct: false }),
    ];
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).toContain('negative_emotion_recognition_under_50');
  });
});

// ---------------------------------------------------------------------------
// Flag 2: complete_absence_pretend_play
// ---------------------------------------------------------------------------
describe('complete_absence_pretend_play', () => {
  it('triggers when exactly 5 pretend tasks are all answered literally (is_correct=false)', () => {
    const tasks = makePretendTasks(5, true);
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).toContain('complete_absence_pretend_play');
  });

  it('does NOT trigger when only 4 tasks are present (even if all literal)', () => {
    const tasks = makePretendTasks(4, true);
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).not.toContain('complete_absence_pretend_play');
  });

  it('does NOT trigger when 5 tasks are present but 1 is correct', () => {
    const tasks = makePretendTasks(5, false);
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).not.toContain('complete_absence_pretend_play');
  });

  it('triggers when more than 5 tasks are present and all are literal', () => {
    const tasks = makePretendTasks(6, true);
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).toContain('complete_absence_pretend_play');
  });
});

// ---------------------------------------------------------------------------
// Flag 3: extreme_sensory_distress
// ---------------------------------------------------------------------------
describe('extreme_sensory_distress', () => {
  it('triggers when 4 or more stimuli are rated distressing', () => {
    const tasks = makeSensoryTasks(4);
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).toContain('extreme_sensory_distress');
  });

  it('triggers when all 6 stimuli are distressing', () => {
    const tasks = makeSensoryTasks(6);
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).toContain('extreme_sensory_distress');
  });

  it('does NOT trigger when only 3 stimuli are distressing', () => {
    const tasks = makeSensoryTasks(3);
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).not.toContain('extreme_sensory_distress');
  });

  it('only counts tasks where sub_scene is "sounds"', () => {
    const nonSoundTasks = Array.from({ length: 5 }, (_, i) =>
      makeTask({
        chapter: 5,
        level: 3,
        task_key: `ch5_l3_visual_${i}`,
        extra_data: { sub_scene: 'visual', distressing: true },
      })
    );
    const flags = detectRedFlags({ taskResponses: nonSoundTasks });
    expect(flags).not.toContain('extreme_sensory_distress');
  });
});

// ---------------------------------------------------------------------------
// Flag 4: rigid_pattern_distress
// ---------------------------------------------------------------------------
describe('rigid_pattern_distress', () => {
  it('triggers when meltdown=true AND returns_to_pattern=true', () => {
    const tasks = [makePatternTask(true, true)];
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).toContain('rigid_pattern_distress');
  });

  it('does NOT trigger when meltdown=true but returns_to_pattern=false', () => {
    const tasks = [makePatternTask(true, false)];
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).not.toContain('rigid_pattern_distress');
  });

  it('does NOT trigger when meltdown=false even if returns_to_pattern=true', () => {
    const tasks = [makePatternTask(false, true)];
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).not.toContain('rigid_pattern_distress');
  });

  it('does NOT trigger with no ch4 l3 tasks', () => {
    const flags = detectRedFlags({ taskResponses: [] });
    expect(flags).not.toContain('rigid_pattern_distress');
  });
});

// ---------------------------------------------------------------------------
// Flag 5: poor_imitation_all_modalities
// ---------------------------------------------------------------------------
describe('poor_imitation_all_modalities', () => {
  it('triggers when 5 or more imitation tasks are incorrect', () => {
    const tasks = makeImitationTasks(5);
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).toContain('poor_imitation_all_modalities');
  });

  it('triggers when 7 imitation tasks are incorrect', () => {
    const tasks = makeImitationTasks(7);
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).toContain('poor_imitation_all_modalities');
  });

  it('does NOT trigger when only 4 tasks are incorrect', () => {
    const tasks = makeImitationTasks(4);
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).not.toContain('poor_imitation_all_modalities');
  });

  it('does NOT trigger when 5 tasks are present but 1 is correct', () => {
    const tasks = [
      ...makeImitationTasks(4),
      makeTask({ chapter: 3, level: 4, task_key: 'ch3_l4_imitation_correct', is_correct: true }),
    ];
    const flags = detectRedFlags({ taskResponses: tasks });
    expect(flags).not.toContain('poor_imitation_all_modalities');
  });
});

// ---------------------------------------------------------------------------
// Pre-recorded flags (already in redFlags array)
// ---------------------------------------------------------------------------
describe('pre-recorded flags from redFlags array', () => {
  it('includes flags already stored in the redFlags array', () => {
    const flags = detectRedFlags({
      taskResponses: [],
      redFlags: ['rigid_pattern_distress', 'extreme_sensory_distress'],
    });
    expect(flags).toContain('rigid_pattern_distress');
    expect(flags).toContain('extreme_sensory_distress');
  });

  it('accepts flag objects with flag_type property', () => {
    const flags = detectRedFlags({
      taskResponses: [],
      redFlags: [{ flag_type: 'complete_absence_pretend_play', severity: 'severe' }],
    });
    expect(flags).toContain('complete_absence_pretend_play');
  });

  it('ignores unknown flag types not in RED_FLAG_MULTIPLIERS', () => {
    const flags = detectRedFlags({
      taskResponses: [],
      redFlags: ['unknown_flag_xyz'],
    });
    expect(flags).not.toContain('unknown_flag_xyz');
  });
});

// ---------------------------------------------------------------------------
// Multiplier stacking via calculateCombinedScore
// ---------------------------------------------------------------------------
describe('multiplier stacking and 2× cap', () => {
  const baseRaw = { social_communication: 100 };

  it('two flags multiply their values (not add)', () => {
    const base = calculateCombinedScore(baseRaw, []);
    const two = calculateCombinedScore(baseRaw, [
      'negative_emotion_recognition_under_50',
      'complete_absence_pretend_play',
    ]);
    expect(two).toBeCloseTo(base * 1.20 * 1.30, 5);
  });

  it('four flags that exceed 2× are capped', () => {
    const base = calculateCombinedScore(baseRaw, []);
    const four = calculateCombinedScore(baseRaw, [
      'negative_emotion_recognition_under_50',
      'complete_absence_pretend_play',
      'extreme_sensory_distress',
      'rigid_pattern_distress',
    ]);
    // 1.20 × 1.30 × 1.15 × 1.20 ≈ 2.154 → capped at 2.0
    expect(four).toBeCloseTo(base * 2.0, 5);
  });

  it('all five flags are still capped at 2.0×', () => {
    const base = calculateCombinedScore(baseRaw, []);
    const all = calculateCombinedScore(baseRaw, Object.keys(RED_FLAG_MULTIPLIERS));
    expect(all).toBeCloseTo(base * 2.0, 5);
  });

  it('three flags below 2× threshold are not capped', () => {
    const base = calculateCombinedScore(baseRaw, []);
    const three = calculateCombinedScore(baseRaw, [
      'extreme_sensory_distress',       // 1.15
      'rigid_pattern_distress',          // 1.20
      'negative_emotion_recognition_under_50', // 1.20
    ]);
    // 1.15 × 1.20 × 1.20 = 1.656 < 2.0 → not capped
    expect(three).toBeCloseTo(base * 1.15 * 1.20 * 1.20, 5);
    expect(three).toBeLessThan(base * 2.0);
  });
});
