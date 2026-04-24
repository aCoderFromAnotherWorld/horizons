/**
 * Static content for Chapter 3 — Social World (social_communication domain).
 */

// ---------------------------------------------------------------------------
// Level 1 — Greeting Sequence
// ---------------------------------------------------------------------------

/** 3 greeting steps. timeout = ms allowed before penalty. */
export const GREETING_STEPS = [
  { id: 'knock',       emoji: '✊', action: 'Knock on the door!',   taskKey: 'ch3_l1_knock', timeout: 8000 },
  { id: 'wave',        emoji: '👋', action: 'Wave back!',            taskKey: 'ch3_l1_wave',  timeout: 8000 },
  { id: 'eye_contact', emoji: '👀', action: 'Look at your friend!', taskKey: 'ch3_l1_eye',   timeout: 8000, eyeContactThresholdMs: 4000 },
];

// ---------------------------------------------------------------------------
// Level 2 — Conversation + Theory of Mind
// ---------------------------------------------------------------------------

/**
 * 6 chat exchanges. Exchange at index 4 is the ToM probe — render differently.
 * option types: 'appropriate' | 'literal' | 'off_topic' | 'tom_correct' | 'tom_wrong'
 */
export const CONVO_EXCHANGES = [
  {
    taskKey: 'ch3_l2_convo_1',
    friendEmoji: '👧',
    friendText: 'Hi! Do you want to play with me?',
    options: [
      { emoji: '😊', text: 'Yes please!',            type: 'appropriate' },
      { emoji: '🚂', text: 'I like trains.',          type: 'literal'     },
      { emoji: '🌤️', text: 'The sky has clouds.',    type: 'off_topic'   },
    ],
  },
  {
    taskKey: 'ch3_l2_convo_2',
    friendEmoji: '👦',
    friendText: "What's your favourite colour?",
    options: [
      { emoji: '💙', text: 'Blue! It\'s so pretty!', type: 'appropriate' },
      { emoji: '📐', text: 'Colours have wavelengths.', type: 'literal'  },
      { emoji: '🍌', text: 'Bananas are yellow.',     type: 'off_topic'   },
    ],
  },
  {
    taskKey: 'ch3_l2_convo_3',
    friendEmoji: '👧',
    friendText: "I'm building a block tower. Can you help?",
    options: [
      { emoji: '🏗️', text: 'Sure, let\'s build!',    type: 'appropriate' },
      { emoji: '📏', text: 'Towers can fall down.',   type: 'literal'     },
      { emoji: '🍕', text: 'I had pizza yesterday.',  type: 'off_topic'   },
    ],
  },
  {
    taskKey: 'ch3_l2_convo_4',
    friendEmoji: '👦',
    friendText: 'I feel a bit sad today.',
    options: [
      { emoji: '🤗', text: "Are you okay? What happened?", type: 'appropriate' },
      { emoji: '🧠', text: 'Sadness is a brain chemical.', type: 'literal'     },
      { emoji: '🍪', text: 'I like cookies!',              type: 'off_topic'   },
    ],
  },
  // Exchange 5 (index 4) — Theory of Mind probe. isTom flag triggers special UI.
  {
    taskKey: 'ch3_l2_tom',
    isTom: true,
    friendEmoji: '👦',
    friendText: 'Watch what happens…',
    options: [
      { emoji: '📦', text: 'In the blue box!', type: 'tom_correct' },
      { emoji: '👜', text: 'In the red bag!',  type: 'tom_wrong'   },
    ],
  },
  {
    taskKey: 'ch3_l2_convo_6',
    friendEmoji: '👧',
    friendText: 'Thanks for playing! See you tomorrow?',
    options: [
      { emoji: '😊', text: "Yes! I'd like that!",    type: 'appropriate' },
      { emoji: '📅', text: 'Tomorrow is Wednesday.', type: 'literal'     },
      { emoji: '💧', text: 'I need some water.',     type: 'off_topic'   },
    ],
  },
];

/** False-belief narrative shown in ToM exchange. */
export const TOM_PROBE = {
  setup: [
    '👦 puts 🧸 inside 📦 blue box.',
    '👦 leaves the room… 🚶',
    'You move 🧸 from 📦 to 👜 red bag.',
    '👦 comes back! 🏃',
  ],
  question: 'Where will your friend look for the toy FIRST?',
};

// ---------------------------------------------------------------------------
// Level 3 — Sharing & Joint Attention
// ---------------------------------------------------------------------------

/**
 * 5 discovery events. Each has a friend_finds phase (attend) and child_finds phase (share).
 * attendKey / shareKey are the task keys for each sub-phase.
 */
export const DISCOVERY_EVENTS = [
  {
    attendKey:   'ch3_l3_attend_1',
    shareKey:    'ch3_l3_share_1',
    friendFinds: { emoji: '⭐', description: 'Friend found a shiny star!' },
    childFinds:  { emoji: '🎨', description: 'You found some crayons!' },
  },
  {
    attendKey:   'ch3_l3_attend_2',
    shareKey:    'ch3_l3_share_2',
    friendFinds: { emoji: '🌈', description: 'Friend found a rainbow card!' },
    childFinds:  { emoji: '🧩', description: 'You found a puzzle piece!' },
  },
  {
    attendKey:   'ch3_l3_attend_3',
    shareKey:    'ch3_l3_share_3',
    friendFinds: { emoji: '🎈', description: 'Friend found a balloon!' },
    childFinds:  { emoji: '🍬', description: 'You found some sweets!' },
  },
  {
    attendKey:   'ch3_l3_attend_4',
    shareKey:    'ch3_l3_share_4',
    friendFinds: { emoji: '🔮', description: 'Friend found a crystal!' },
    childFinds:  { emoji: '📚', description: 'You found a storybook!' },
  },
  {
    attendKey:   'ch3_l3_attend_5',
    shareKey:    'ch3_l3_share_5',
    friendFinds: { emoji: '🎵', description: 'Friend found a music note!' },
    childFinds:  { emoji: '🎁', description: 'You found a gift!' },
  },
];

// ---------------------------------------------------------------------------
// Level 4 — Copy Cat (Imitation)
// ---------------------------------------------------------------------------

/**
 * 10 imitation actions.
 * modality: 'facial' | 'body' | 'object'
 * animType: drives the Framer Motion animation in the level page.
 * options: 4 emojis; correctIndex is 0-based index of the correct answer.
 */
export const IMITATION_ACTIONS = [
  // Facial (4)
  { taskKey: 'ch3_l4_imitation_1',  modality: 'facial', emoji: '😛', label: 'Tongue out',   animType: 'y_bounce',  options: ['😛', '😊', '😮', '😴'], correctIndex: 0 },
  { taskKey: 'ch3_l4_imitation_2',  modality: 'facial', emoji: '😉', label: 'Wink',          animType: 'flicker',   options: ['😠', '😉', '😢', '😊'], correctIndex: 1 },
  { taskKey: 'ch3_l4_imitation_3',  modality: 'facial', emoji: '😁', label: 'Big smile',     animType: 'scale',     options: ['😁', '😐', '😯', '😟'], correctIndex: 0 },
  { taskKey: 'ch3_l4_imitation_4',  modality: 'facial', emoji: '🤨', label: 'Eyebrow raise', animType: 'y_up',      options: ['😤', '😑', '🤨', '😐'], correctIndex: 2 },
  // Body (3)
  { taskKey: 'ch3_l4_imitation_5',  modality: 'body',   emoji: '👋', label: 'Wave',          animType: 'rotate',    options: ['👊', '👏', '👋', '🤚'], correctIndex: 2 },
  { taskKey: 'ch3_l4_imitation_6',  modality: 'body',   emoji: '👏', label: 'Clap',          animType: 'scale',     options: ['👏', '🤙', '✌️', '👐'], correctIndex: 0 },
  { taskKey: 'ch3_l4_imitation_7',  modality: 'body',   emoji: '🦶', label: 'Stomp',         animType: 'y_bounce',  options: ['🦶', '💪', '🖐️', '✊'], correctIndex: 0 },
  // Object use (3)
  { taskKey: 'ch3_l4_imitation_8',  modality: 'object', emoji: '💇', label: 'Comb hair',     animType: 'x_sweep',   options: ['💇', '🦷', '✏️', '🍽️'], correctIndex: 0 },
  { taskKey: 'ch3_l4_imitation_9',  modality: 'object', emoji: '🥤', label: 'Drink',         animType: 'tilt',      options: ['🍽️', '🥤', '🧴', '🖊️'],  correctIndex: 1 },
  { taskKey: 'ch3_l4_imitation_10', modality: 'object', emoji: '✏️', label: 'Draw',          animType: 'x_sweep',   options: ['🎨', '📚', '✏️', '🪣'],  correctIndex: 2 },
];

/** Maps animType → Framer Motion animate props for the action clip. */
export const ANIM_VARIANTS = {
  y_bounce: { animate: { y: [0, -18, 0, -18, 0] }, transition: { duration: 1.0, repeat: 2, ease: 'easeInOut' } },
  flicker:  { animate: { opacity: [1, 0.3, 1, 0.3, 1] }, transition: { duration: 0.8, repeat: 2 } },
  scale:    { animate: { scale: [1, 1.35, 1, 1.35, 1] }, transition: { duration: 0.8, repeat: 2, ease: 'easeInOut' } },
  y_up:     { animate: { y: [0, -12, 0] }, transition: { duration: 0.6, repeat: 3, ease: 'easeOut' } },
  rotate:   { animate: { rotate: [-20, 20, -20, 20, 0] }, transition: { duration: 1.0, repeat: 2, ease: 'easeInOut' } },
  x_sweep:  { animate: { x: [-10, 10, -10, 10, 0] }, transition: { duration: 0.9, repeat: 2, ease: 'easeInOut' } },
  tilt:     { animate: { rotate: [0, -30, 0, -30, 0] }, transition: { duration: 1.0, repeat: 2, ease: 'easeInOut' } },
};

export const L4_PRACTICE_STEPS = [
  { emoji: '👀', label: 'Watch my move carefully!' },
  { emoji: '👆', label: 'Then tap the matching action!' },
];
