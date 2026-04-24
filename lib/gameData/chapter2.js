/**
 * Static content for Chapter 2 — Feeling World (social_communication domain).
 */

/** 12 face cards: 3 per emotion × 4 emotions. task keys: ch2_l1_face_1 … ch2_l1_face_12 */
export const FACE_CARDS = [
  // Happy (child, adult, animal)
  { emoji: '😄', emotion: 'happy', style: 'child',  taskKey: 'ch2_l1_face_1' },
  { emoji: '😊', emotion: 'happy', style: 'adult',  taskKey: 'ch2_l1_face_2' },
  { emoji: '🐶', emotion: 'happy', style: 'animal', taskKey: 'ch2_l1_face_3' },
  // Sad
  { emoji: '😢', emotion: 'sad',   style: 'child',  taskKey: 'ch2_l1_face_4' },
  { emoji: '😟', emotion: 'sad',   style: 'adult',  taskKey: 'ch2_l1_face_5' },
  { emoji: '🐱', emotion: 'sad',   style: 'animal', taskKey: 'ch2_l1_face_6' },
  // Angry
  { emoji: '😠', emotion: 'angry', style: 'child',  taskKey: 'ch2_l1_face_7' },
  { emoji: '😤', emotion: 'angry', style: 'adult',  taskKey: 'ch2_l1_face_8' },
  { emoji: '😾', emotion: 'angry', style: 'animal', taskKey: 'ch2_l1_face_9' },
  // Scared
  { emoji: '😨', emotion: 'scared', style: 'child',  taskKey: 'ch2_l1_face_10' },
  { emoji: '😰', emotion: 'scared', style: 'adult',  taskKey: 'ch2_l1_face_11' },
  { emoji: '🐰', emotion: 'scared', style: 'animal', taskKey: 'ch2_l1_face_12' },
];

/** 8 contextual scenario cards. task keys: ch2_l1_scenario_1 … ch2_l1_scenario_8 */
export const SCENARIO_CARDS = [
  { emoji: '🎂🎉', description: 'It\'s my birthday!',        correctEmotion: 'happy',  taskKey: 'ch2_l1_scenario_1' },
  { emoji: '🧸💔', description: 'My toy broke.',             correctEmotion: 'sad',    taskKey: 'ch2_l1_scenario_2' },
  { emoji: '👧😤', description: 'Someone took my crayon!',   correctEmotion: 'angry',  taskKey: 'ch2_l1_scenario_3' },
  { emoji: '⚡🌩️', description: 'A big thunder sound!',      correctEmotion: 'scared', taskKey: 'ch2_l1_scenario_4' },
  { emoji: '🍦😊', description: 'I got an ice cream!',       correctEmotion: 'happy',  taskKey: 'ch2_l1_scenario_5' },
  { emoji: '🐶🏃', description: 'My pet ran away.',          correctEmotion: 'sad',    taskKey: 'ch2_l1_scenario_6' },
  { emoji: '🧒😡', description: 'They keep pushing me!',     correctEmotion: 'angry',  taskKey: 'ch2_l1_scenario_7' },
  { emoji: '🌑😱', description: 'The lights went out!',      correctEmotion: 'scared', taskKey: 'ch2_l1_scenario_8' },
];

/** 4 emotion drop buckets used in Level 1. id must match emotion strings in FACE_CARDS. */
export const EMOTION_BUCKETS = [
  { id: 'happy',  emoji: '😊', label: 'Happy' },
  { id: 'sad',    emoji: '😢', label: 'Sad'   },
  { id: 'angry',  emoji: '😠', label: 'Angry' },
  { id: 'scared', emoji: '😨', label: 'Scared' },
];

// ---------------------------------------------------------------------------
// Level 2 — Expression Mirror
// ---------------------------------------------------------------------------

/** Option shapes for each emotion. type drives scoring. */
const HAPPY_OPTS = [
  { emoji: '😄', type: 'correct',   emotion: 'happy'  },
  { emoji: '🙂', type: 'intensity', emotion: 'happy'  },
  { emoji: '😐', type: 'neutral',   emotion: 'neutral' },
  { emoji: '😢', type: 'opposite',  emotion: 'sad'    },
  { emoji: '😠', type: 'other',     emotion: 'angry'  },
  { emoji: '😨', type: 'other',     emotion: 'scared' },
];
const SAD_OPTS = [
  { emoji: '😢', type: 'correct',   emotion: 'sad'    },
  { emoji: '😟', type: 'intensity', emotion: 'sad'    },
  { emoji: '😐', type: 'neutral',   emotion: 'neutral' },
  { emoji: '😄', type: 'opposite',  emotion: 'happy'  },
  { emoji: '😠', type: 'other',     emotion: 'angry'  },
  { emoji: '😨', type: 'other',     emotion: 'scared' },
];
const ANGRY_OPTS = [
  { emoji: '😠', type: 'correct',   emotion: 'angry'  },
  { emoji: '😤', type: 'intensity', emotion: 'angry'  },
  { emoji: '😐', type: 'neutral',   emotion: 'neutral' },
  { emoji: '😊', type: 'opposite',  emotion: 'happy'  },
  { emoji: '😢', type: 'other',     emotion: 'sad'    },
  { emoji: '😨', type: 'other',     emotion: 'scared' },
];
const SCARED_OPTS = [
  { emoji: '😨', type: 'correct',   emotion: 'scared' },
  { emoji: '😰', type: 'intensity', emotion: 'scared' },
  { emoji: '😐', type: 'neutral',   emotion: 'neutral' },
  { emoji: '😊', type: 'opposite',  emotion: 'happy'  },
  { emoji: '😢', type: 'other',     emotion: 'sad'    },
  { emoji: '😠', type: 'other',     emotion: 'angry'  },
];

/** Rotate array by n positions to vary the correct answer position. */
function rotate(arr, n) {
  const len = arr.length;
  return [...arr.slice(n % len), ...arr.slice(0, n % len)];
}

/** 16 mirror trials — 4 per emotion with rotated option order. */
export const MIRROR_TRIALS = [
  // -- happy --
  { emotion: 'happy',  word: 'Happy',  cue: 'major',  taskKey: 'ch2_l2_mirror_1',  options: rotate(HAPPY_OPTS, 0) },
  { emotion: 'happy',  word: 'Happy',  cue: 'major',  taskKey: 'ch2_l2_mirror_5',  options: rotate(HAPPY_OPTS, 2) },
  { emotion: 'happy',  word: 'Happy',  cue: 'major',  taskKey: 'ch2_l2_mirror_9',  options: rotate(HAPPY_OPTS, 4) },
  { emotion: 'happy',  word: 'Happy',  cue: 'major',  taskKey: 'ch2_l2_mirror_13', options: rotate(HAPPY_OPTS, 1) },
  // -- sad --
  { emotion: 'sad',    word: 'Sad',    cue: 'minor',  taskKey: 'ch2_l2_mirror_2',  options: rotate(SAD_OPTS, 0) },
  { emotion: 'sad',    word: 'Sad',    cue: 'minor',  taskKey: 'ch2_l2_mirror_6',  options: rotate(SAD_OPTS, 2) },
  { emotion: 'sad',    word: 'Sad',    cue: 'minor',  taskKey: 'ch2_l2_mirror_10', options: rotate(SAD_OPTS, 4) },
  { emotion: 'sad',    word: 'Sad',    cue: 'minor',  taskKey: 'ch2_l2_mirror_14', options: rotate(SAD_OPTS, 3) },
  // -- angry --
  { emotion: 'angry',  word: 'Angry',  cue: 'dissonant', taskKey: 'ch2_l2_mirror_3',  options: rotate(ANGRY_OPTS, 0) },
  { emotion: 'angry',  word: 'Angry',  cue: 'dissonant', taskKey: 'ch2_l2_mirror_7',  options: rotate(ANGRY_OPTS, 2) },
  { emotion: 'angry',  word: 'Angry',  cue: 'dissonant', taskKey: 'ch2_l2_mirror_11', options: rotate(ANGRY_OPTS, 4) },
  { emotion: 'angry',  word: 'Angry',  cue: 'dissonant', taskKey: 'ch2_l2_mirror_15', options: rotate(ANGRY_OPTS, 1) },
  // -- scared --
  { emotion: 'scared', word: 'Scared', cue: 'minor',  taskKey: 'ch2_l2_mirror_4',  options: rotate(SCARED_OPTS, 0) },
  { emotion: 'scared', word: 'Scared', cue: 'minor',  taskKey: 'ch2_l2_mirror_8',  options: rotate(SCARED_OPTS, 3) },
  { emotion: 'scared', word: 'Scared', cue: 'minor',  taskKey: 'ch2_l2_mirror_12', options: rotate(SCARED_OPTS, 4) },
  { emotion: 'scared', word: 'Scared', cue: 'minor',  taskKey: 'ch2_l2_mirror_16', options: rotate(SCARED_OPTS, 2) },
];

// ---------------------------------------------------------------------------
// Level 3 — Regulation Scenarios
// ---------------------------------------------------------------------------

/** 6 regulation scenarios. options ordered: appropriate, avoidant, aggressive. */
export const REGULATION_SCENARIOS = [
  {
    taskKey: 'ch2_l3_regulation_1',
    emoji: '🍦😱',
    description: 'Oh no! My ice cream fell on the floor.',
    options: [
      { label: '😔 It\'s okay', type: 'appropriate' },
      { label: '🙈 Say nothing', type: 'avoidant'    },
      { label: '💢 Scream!',     type: 'aggressive'  },
    ],
  },
  {
    taskKey: 'ch2_l3_regulation_2',
    emoji: '🧸👋',
    description: 'Someone took my favourite toy.',
    options: [
      { label: '🗣️ Tell an adult', type: 'appropriate' },
      { label: '🏃 Walk away',     type: 'avoidant'    },
      { label: '👊 Push them!',    type: 'aggressive'  },
    ],
  },
  {
    taskKey: 'ch2_l3_regulation_3',
    emoji: '🔊😖',
    description: 'There is a very loud noise outside.',
    options: [
      { label: '🙉 Cover ears & breathe', type: 'appropriate' },
      { label: '🚪 Hide under the bed',   type: 'avoidant'    },
      { label: '😡 Yell at everyone',     type: 'aggressive'  },
    ],
  },
  {
    taskKey: 'ch2_l3_regulation_4',
    emoji: '🔍😟',
    description: 'I can\'t find my favourite book!',
    options: [
      { label: '🗣️ Ask for help', type: 'appropriate' },
      { label: '😶 Give up',      type: 'avoidant'    },
      { label: '💢 Throw things', type: 'aggressive'  },
    ],
  },
  {
    taskKey: 'ch2_l3_regulation_5',
    emoji: '🧸💔',
    description: 'My toy is broken and I can\'t fix it.',
    options: [
      { label: '😌 It\'s okay, things break', type: 'appropriate' },
      { label: '🛏️ Lie down & ignore it',     type: 'avoidant'    },
      { label: '🗑️ Break it even more',        type: 'aggressive'  },
    ],
  },
  {
    taskKey: 'ch2_l3_regulation_6',
    emoji: '👧👦😤',
    description: 'My friend won\'t share and it makes me mad.',
    options: [
      { label: '🤝 Talk it out',  type: 'appropriate' },
      { label: '😶 Stay quiet',   type: 'avoidant'    },
      { label: '😠 Shout at them', type: 'aggressive' },
    ],
  },
];

/** Practice steps for all three levels */
export const L1_PRACTICE_STEPS = [
  { emoji: '😊', label: 'I\'ll show you some faces and scenes!' },
  { emoji: '😢', label: 'Drag each one to the matching feeling!' },
];
export const L2_PRACTICE_STEPS = [
  { emoji: '😄', label: 'I\'ll show you a feeling word and a sound.' },
  { emoji: '👆', label: 'Tap the face that matches the feeling!' },
];
export const L3_PRACTICE_STEPS = [
  { emoji: '😊', label: 'I\'ll show you something that happened.' },
  { emoji: '🤔', label: 'Choose the best way to feel about it!' },
];
