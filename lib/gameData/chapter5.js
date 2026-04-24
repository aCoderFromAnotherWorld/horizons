/**
 * Static content for Chapter 5 — Pretend & Senses (pretend_play + sensory_processing domains).
 */

// ---------------------------------------------------------------------------
// Level 1 — Pretend Play Recognition
// ---------------------------------------------------------------------------

export const PRETEND_CLIPS = [
  { taskKey: 'ch5_l1_pretend_1', frames: ['🍌', '📞', '😊'], description: 'Banana → Phone',    literalLabel: "📌 That's just a banana!" },
  { taskKey: 'ch5_l1_pretend_2', frames: ['🫙', '🥄', '😋'], description: 'Empty pot → Soup',  literalLabel: '📌 The pot is empty!'      },
  { taskKey: 'ch5_l1_pretend_3', frames: ['🧸', '🥄', '😊'], description: 'Feeding teddy',     literalLabel: "📌 Teddy can't eat!"       },
  { taskKey: 'ch5_l1_pretend_4', frames: ['🧱', '🚗', '💨'], description: 'Block → Car',       literalLabel: "📌 That's just a block!"   },
  { taskKey: 'ch5_l1_pretend_5', frames: ['🫗', '😄', '😊'], description: 'Empty cup → Drink', literalLabel: '📌 The cup is empty!'      },
];

export const L1_PRACTICE_STEPS = [
  { emoji: '🎭', label: 'Some things in the game are pretend!' },
  { emoji: '👆', label: "Tap 🎭 Pretending or 📌 It's real!" },
];

// ---------------------------------------------------------------------------
// Level 2 — Create Pretend World
// ---------------------------------------------------------------------------

export const SCENE_PROMPTS = [
  { id: 'tea_party', emoji: '🫖', label: 'Tea Party!'        },
  { id: 'superhero', emoji: '🦸', label: 'Superheroes!'      },
  { id: 'trip',      emoji: '✈️', label: 'Going on a Trip!'  },
  { id: 'house',     emoji: '🏠', label: 'Building a House!' },
];

/** symbolic: true = eligible for pretend/symbolic use */
export const OBJECT_PALETTE = [
  { id: 'chair',  emoji: '🪑', label: 'Chair',  symbolic: false },
  { id: 'plate',  emoji: '🍽️', label: 'Plate',  symbolic: false },
  { id: 'hat',    emoji: '🎩', label: 'Hat',    symbolic: false },
  { id: 'bag',    emoji: '👜', label: 'Bag',    symbolic: false },
  { id: 'teddy',  emoji: '🧸', label: 'Teddy',  symbolic: true  },
  { id: 'box',    emoji: '📦', label: 'Box',    symbolic: true  },
  { id: 'spoon',  emoji: '🥄', label: 'Spoon',  symbolic: true  },
  { id: 'cup',    emoji: '🫗', label: 'Cup',    symbolic: true  },
  { id: 'block',  emoji: '🧱', label: 'Block',  symbolic: true  },
  { id: 'wand',   emoji: '🪄', label: 'Wand',   symbolic: true  },
];

// ---------------------------------------------------------------------------
// Level 3A — Sensory Sounds
// ---------------------------------------------------------------------------

export const SENSORY_SOUNDS = [
  { id: 'birds',    emoji: '🐦', label: 'Birds chirping', cueType: 'birds'    },
  { id: 'fountain', emoji: '💧', label: 'Water fountain', cueType: 'fountain' },
  { id: 'laughter', emoji: '😄', label: 'Laughter',       cueType: 'laughter' },
  { id: 'vacuum',   emoji: '🌀', label: 'Vacuum cleaner', cueType: 'vacuum'   },
  { id: 'thunder',  emoji: '⚡', label: 'Thunder crack',  cueType: 'thunder'  },
  { id: 'traffic',  emoji: '🚗', label: 'Street traffic', cueType: 'traffic'  },
];

export const SOUND_RATINGS = [
  { emoji: '😊', label: 'Love it!',        type: 'happy',   baseScore: 0, coverBonus: 0, distressing: false },
  { emoji: '😐', label: "It's okay",       type: 'neutral', baseScore: 0, coverBonus: 0, distressing: false },
  { emoji: '😟', label: "I'm worried",     type: 'worried', baseScore: 1, coverBonus: 0, distressing: true  },
  { emoji: '😢', label: "I'm upset",       type: 'upset',   baseScore: 2, coverBonus: 0, distressing: true  },
  { emoji: '🙉', label: 'Cover my ears!',  type: 'cover',   baseScore: 1, coverBonus: 1, distressing: true  },
  { emoji: '🚪', label: 'I want to leave!',type: 'leave',   baseScore: 2, coverBonus: 2, distressing: true  },
];

// ---------------------------------------------------------------------------
// Level 3B — Texture / Visual Cards
// ---------------------------------------------------------------------------

export const TEXTURE_CARDS = [
  { id: 'wavy',       emoji: '🌊', label: 'Wavy'       },
  { id: 'solid',      emoji: '🟦', label: 'Solid'      },
  { id: 'spiky',      emoji: '✴️', label: 'Spiky'      },
  { id: 'rough',      emoji: '🟤', label: 'Rough'      },
  { id: 'wet',        emoji: '💧', label: 'Wet'        },
  { id: 'bright',     emoji: '🌈', label: 'Bright'     },
  { id: 'flickering', emoji: '⚡', label: 'Flickering' },
  { id: 'spinning',   emoji: '🌀', label: 'Spinning'   },
];

export const TEXTURE_ZONES = [
  { id: 'love',     emoji: '❤️', label: 'Love',        score: 0, aversive: false },
  { id: 'okay',     emoji: '👍', label: 'Okay',        score: 0, aversive: false },
  { id: 'dislike',  emoji: '👎', label: 'Dislike',     score: 1, aversive: true  },
  { id: 'no_touch', emoji: '✋', label: "Won't touch", score: 2, aversive: true  },
];
