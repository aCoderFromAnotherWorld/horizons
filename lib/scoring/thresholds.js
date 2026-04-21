export const DOMAIN_WEIGHTS = {
  social_communication: 0.4,
  restricted_repetitive: 0.3,
  sensory_processing: 0.15,
  pretend_play: 0.15,
};

export const DOMAIN_MAX_POINTS = {
  social_communication: 100,
  restricted_repetitive: 70,
  sensory_processing: 30,
  pretend_play: 40,
};

export const DOMAIN_THRESHOLDS = {
  social_communication: {
    low: [0, 20],
    medium: [21, 45],
    high: [46, 65],
    very_high: [66, Infinity],
  },
  restricted_repetitive: {
    low: [0, 15],
    medium: [16, 30],
    high: [31, Infinity],
  },
  sensory_processing: {
    low: [0, 8],
    medium: [9, 15],
    high: [16, Infinity],
  },
  pretend_play: {
    low: [0, 10],
    medium: [11, 20],
    high: [21, Infinity],
  },
};

export const COMBINED_THRESHOLDS = {
  low: [0, 25],
  medium: [26, 45],
  high: [46, 65],
  very_high: [66, Infinity],
};

export const RED_FLAG_MULTIPLIERS = {
  negative_emotion_recognition_under_50: 1.2,
  complete_absence_pretend_play: 1.3,
  extreme_sensory_4plus_distressing_sounds: 1.15,
  rigid_pattern_plus_distress_at_change: 1.2,
  poor_imitation_all_modalities: 1.25,
};
