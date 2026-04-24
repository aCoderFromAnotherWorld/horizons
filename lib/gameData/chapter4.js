/**
 * Static content for Chapter 4 — Routine & Patterns (restricted_repetitive domain).
 */

// ---------------------------------------------------------------------------
// Level 1 — Morning Routine Sequence
// ---------------------------------------------------------------------------

export const ROUTINE_CARDS = [
  { id: 'wake',      emoji: '⏰', label: 'Wake Up',      correctPos: 0 },
  { id: 'teeth',     emoji: '🦷', label: 'Brush Teeth',  correctPos: 1 },
  { id: 'dress',     emoji: '👕', label: 'Get Dressed',  correctPos: 2 },
  { id: 'breakfast', emoji: '🥣', label: 'Breakfast',    correctPos: 3 },
  { id: 'pack',      emoji: '🎒', label: 'Pack Bag',     correctPos: 4 },
  { id: 'shoes',     emoji: '👟', label: 'Put on Shoes', correctPos: 5 },
];

export const CORRECT_ORDER = ['wake', 'teeth', 'dress', 'breakfast', 'pack', 'shoes'];

export const DISRUPTION_SCENARIO = {
  taskKey: 'ch4_l1_disruption',
  emoji: '😮',
  text: 'Oh no! The clean shirt is in the wash!',
  options: [
    { label: '😊 Wear a different shirt!',     type: 'flexible' },
    { label: '😐 Hmm, I need to think…',       type: 'neutral'  },
    { label: '😤 I can ONLY wear THAT shirt!', type: 'rigid'    },
  ],
};

// ---------------------------------------------------------------------------
// Level 2 — Flexibility Challenge
// ---------------------------------------------------------------------------

export const ACTIVITIES = [
  { id: 'swings', emoji: '🎠', label: 'Swings'  },
  { id: 'slide',  emoji: '🛝', label: 'Slide'   },
  { id: 'blocks', emoji: '🧱', label: 'Blocks'  },
  { id: 'draw',   emoji: '✏️', label: 'Drawing' },
  { id: 'ball',   emoji: '⚽', label: 'Ball'    },
];

export const UNEXPECTED_SCENARIOS = [
  {
    taskKey: 'ch4_l2_scenario_1',
    emoji: '🚧',
    description: "The path to the park is blocked! You can't go that way.",
    options: [
      { label: "🗺️ Let's find another way!", type: 'flexible' },
      { label: '😢 I\'m upset but okay…',    type: 'distress' },
      { label: '😡 I MUST go that exact way!', type: 'rigid'  },
    ],
  },
  {
    taskKey: 'ch4_l2_scenario_2',
    emoji: '🌧️',
    description: "It's raining! The outdoor picnic is cancelled.",
    options: [
      { label: "🏠 Let's have a picnic inside!", type: 'flexible' },
      { label: "😢 I'm really disappointed…",   type: 'distress' },
      { label: '😤 We HAVE to go outside!',      type: 'rigid'    },
    ],
  },
  {
    taskKey: 'ch4_l2_scenario_3',
    emoji: '🤷',
    description: 'Your favourite food is sold out today!',
    options: [
      { label: "🍕 I'll try something else!",  type: 'flexible' },
      { label: '😟 That makes me really sad…', type: 'distress' },
      { label: '😠 I only eat THAT food!',     type: 'rigid'    },
    ],
  },
];

// ---------------------------------------------------------------------------
// Level 3 — Pattern Detective
// ---------------------------------------------------------------------------

export const PATTERNS = [
  {
    taskKey:    'ch4_l3_pattern_1',
    type:       'AB',
    sequence:   ['🔴', '🔵', '🔴', '🔵', '🔴'],
    answer:     '🔵',
    options:    ['🔵', '🔴', '⭐', '🟢'],
    correctIdx: 0,
  },
  {
    taskKey:    'ch4_l3_pattern_2',
    type:       'ABC',
    sequence:   ['⭐', '🌙', '☀️', '⭐', '🌙'],
    answer:     '☀️',
    options:    ['⭐', '☀️', '🌙', '💧'],
    correctIdx: 1,
  },
  {
    taskKey:    'ch4_l3_pattern_3',
    type:       'AABBC',
    sequence:   ['🟥', '🟥', '🟦', '🟦', '🟩'],
    answer:     '🟩',
    options:    ['🟥', '🟦', '🟩', '🟪'],
    correctIdx: 2,
  },
];

export const PATTERN_PRACTICE_STEPS = [
  { emoji: '🔴🔵', label: 'Look at the pattern — what comes next?' },
  { emoji: '👆',   label: 'Tap the emoji that continues the pattern!' },
];

// ---------------------------------------------------------------------------
// Level 4 — Special Interests
// ---------------------------------------------------------------------------

export const TOPIC_BOOKS = [
  {
    id: 'trains',
    emoji: '🚂',
    label: 'Trains',
    facts: [
      '🚂 Trains run on metal rails!',
      '🚃 Some trains have 200 wagons!',
      '🚄 The fastest train goes 600 km/h!',
      '🚉 Grand Central has 44 platforms!',
      '🌍 Rail connects every continent!',
    ],
  },
  {
    id: 'space',
    emoji: '🌌',
    label: 'Space',
    facts: [
      '🌌 There are 2 trillion galaxies!',
      '☀️ The Sun is 1 million Earths big!',
      "🪐 Saturn's rings are made of ice!",
      '🌑 The Moon has no atmosphere!',
      '🚀 Humans last walked on Moon in 1972!',
    ],
  },
  {
    id: 'animals',
    emoji: '🐾',
    label: 'Animals',
    facts: [
      '🐘 Elephants never forget!',
      '🦒 Giraffes sleep only 2 hours a day!',
      '🐬 Dolphins have names for each other!',
      '🦜 Parrots can learn 100+ words!',
      '🐙 Octopuses have three hearts!',
    ],
  },
  {
    id: 'numbers',
    emoji: '🔢',
    label: 'Numbers',
    facts: [
      '🔢 Zero was invented in India!',
      '♾️ Pi goes on forever!',
      '💯 100 is a perfect square!',
      '🌀 Fibonacci appears in nature!',
      '🎱 1+2+3…+n = n(n+1)/2!',
    ],
  },
  {
    id: 'colors',
    emoji: '🎨',
    label: 'Colors',
    facts: [
      '🌈 Light splits into 7 colors!',
      '🎨 Red + Blue = Purple!',
      '🌊 Blue is the most calming color!',
      '🌟 Gold is called warm!',
      '🦋 Butterflies see ultraviolet light!',
    ],
  },
  {
    id: 'dinos',
    emoji: '🦕',
    label: 'Dinosaurs',
    facts: [
      '🦕 Dinos lived for 165 million years!',
      '🦖 T-Rex had tiny arms!',
      '🥚 Baby dinos hatched from eggs!',
      '🌿 Most dinos were plant-eaters!',
      '☄️ A meteorite changed everything 66M years ago!',
    ],
  },
  {
    id: 'cars',
    emoji: '🚗',
    label: 'Cars',
    facts: [
      '🚗 First car was built in 1885!',
      '⚡ Electric cars have no exhaust!',
      '🏎️ F1 cars go over 350 km/h!',
      '🤖 Self-driving cars use radar!',
      '🌍 There are 1.4 billion cars on Earth!',
    ],
  },
  {
    id: 'music',
    emoji: '🎵',
    label: 'Music',
    facts: [
      '🎵 Music triggers the same brain area as food!',
      '🎸 Guitars have 6 strings!',
      '🥁 Drums are the oldest instrument!',
      '🎹 A piano has 88 keys!',
      '🎤 Singing releases happy chemicals!',
    ],
  },
];
