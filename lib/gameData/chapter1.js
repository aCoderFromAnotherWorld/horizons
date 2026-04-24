/**
 * Static content definitions for Chapter 1 — My World (Baseline).
 * Chapter 1 is unscored for domain purposes but responses are recorded.
 */

/** 3 name-response trials. delay = inter-trial pause in ms. */
export const NAME_RESPONSE_TRIALS = [
  { taskKey: 'ch1_l1_name_1', delay: 5000, gueCue: 'Guide calls your name the first time' },
  { taskKey: 'ch1_l1_name_2', delay: 5000, gueCue: 'Guide calls your name again' },
  { taskKey: 'ch1_l1_name_3', delay: 5000, gueCue: 'Guide calls your name one more time' },
];

/**
 * 5 guide-pointing targets placed across the screen.
 * x/y are percentages relative to the viewport.
 */
export const GUIDE_TARGETS = [
  { emoji: '⭐', x: 20, y: 22, taskKey: 'ch1_l2_guide_1' },
  { emoji: '🌈', x: 72, y: 18, taskKey: 'ch1_l2_guide_2' },
  { emoji: '🎈', x: 12, y: 65, taskKey: 'ch1_l2_guide_3' },
  { emoji: '🌸', x: 76, y: 70, taskKey: 'ch1_l2_guide_4' },
  { emoji: '🍦', x: 46, y: 78, taskKey: 'ch1_l2_guide_5' },
];

/** Practice demo steps for Level 2 */
export const LEVEL2_PRACTICE_STEPS = [
  { emoji: '🦊', label: 'Watch my guide point to something!' },
  { emoji: '⭐', label: 'Now tap what the guide points at!' },
];
