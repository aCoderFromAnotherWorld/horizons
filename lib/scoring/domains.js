/** Fractional weight each domain contributes to the combined score. Must sum to 1.0. */
export const DOMAIN_WEIGHTS = {
  social_communication:  0.40,
  restricted_repetitive: 0.30,
  pretend_play:          0.15,
  sensory_processing:    0.15,
};

/** Maximum raw points achievable per domain. */
export const DOMAIN_MAX_POINTS = {
  social_communication:  100,
  restricted_repetitive: 70,
  pretend_play:          40,
  sensory_processing:    30,
};

/**
 * Maps chapter keys to the domain they score, or null for unscored chapters.
 * @type {Record<string, string|null>}
 */
export const CHAPTER_TO_DOMAIN = {
  ch1_baseline: null,
  ch2_emotion:  'social_communication',
  ch3_social:   'social_communication',
  ch4_routine:  'restricted_repetitive',
  ch5_pretend:  'pretend_play',
  ch5_sensory:  'sensory_processing',
  ch6_summary:  null,
};
