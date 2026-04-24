// Risk threshold ranges per domain. Each entry is [min, max] inclusive; max of Infinity = no upper bound.
export const DOMAIN_THRESHOLDS = {
  social_communication: {
    low:       [0,  20],
    medium:    [21, 45],
    high:      [46, 65],
    very_high: [66, Infinity],
  },
  restricted_repetitive: {
    low:       [0,  15],
    medium:    [16, 30],
    high:      [31, Infinity],
  },
  pretend_play: {
    low:       [0,  10],
    medium:    [11, 20],
    high:      [21, Infinity],
  },
  sensory_processing: {
    low:       [0,  8],
    medium:    [9,  15],
    high:      [16, Infinity],
  },
};

export const COMBINED_THRESHOLDS = {
  low:       [0,  25],
  medium:    [26, 45],
  high:      [46, 65],
  very_high: [66, Infinity],
};
