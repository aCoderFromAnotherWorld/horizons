/**
 * Task pool for Chapter 6 Grand Finale.
 * Each task mirrors a mechanic from Chapters 1–5.
 * Sampled deterministically using sessionId as seed (15 tasks per session).
 *
 * mechanic types used by DynamicTask:
 *   'tap_target'      — big emoji prompt; child taps a large button
 *   'grid_select'     — stimulus emoji shown; child taps correct answer from grid
 *   'scenario_choice' — text scenario; 3 labelled response buttons
 *   'drag_sort'       — small list of 3–4 items to reorder
 */
export const CHAPTER6_TASK_POOL = [

  // ── Chapter 1 – Baseline ──────────────────────────────────────────────────
  {
    key: 'ch6_name_1', chapter: 1, level: 1, mechanic: 'tap_target',
    domain: null, label: 'Name Response A',
    emoji: '🦊', prompt: 'Your guide is calling your name! Tap to respond!',
    options: [],
  },
  {
    key: 'ch6_name_2', chapter: 1, level: 1, mechanic: 'tap_target',
    domain: null, label: 'Name Response B',
    emoji: '🐻', prompt: 'Someone is calling you! Tap when you hear it!',
    options: [],
  },
  {
    key: 'ch6_name_3', chapter: 1, level: 1, mechanic: 'tap_target',
    domain: null, label: 'Name Response C',
    emoji: '🦁', prompt: 'Your friend is calling! Tap the guide to answer!',
    options: [],
  },
  {
    key: 'ch6_guide_1', chapter: 1, level: 2, mechanic: 'tap_target',
    domain: null, label: 'Follow the Guide A',
    emoji: '⭐', prompt: 'The guide is pointing at something! Tap what they see!',
    options: [],
  },
  {
    key: 'ch6_guide_2', chapter: 1, level: 2, mechanic: 'tap_target',
    domain: null, label: 'Follow the Guide B',
    emoji: '🌟', prompt: 'Look where the guide is pointing — tap it!',
    options: [],
  },

  // ── Chapter 2 – Emotion Matching ─────────────────────────────────────────
  {
    key: 'ch6_emotion_1', chapter: 2, level: 1, mechanic: 'grid_select',
    domain: 'social_communication', label: 'Emotion Match – Happy',
    emoji: '😊',
    prompt: 'Which feeling is this face showing?',
    options: [
      { emoji: '😊', label: 'Happy',  correct: true,  scorePoints: 0 },
      { emoji: '😢', label: 'Sad',    correct: false, scorePoints: 2 },
      { emoji: '😠', label: 'Angry',  correct: false, scorePoints: 2 },
      { emoji: '😨', label: 'Scared', correct: false, scorePoints: 2 },
    ],
  },
  {
    key: 'ch6_emotion_2', chapter: 2, level: 1, mechanic: 'grid_select',
    domain: 'social_communication', label: 'Emotion Match – Sad',
    emoji: '😢',
    prompt: 'Which feeling is this face showing?',
    options: [
      { emoji: '😊', label: 'Happy',  correct: false, scorePoints: 2 },
      { emoji: '😢', label: 'Sad',    correct: true,  scorePoints: 0 },
      { emoji: '😠', label: 'Angry',  correct: false, scorePoints: 2 },
      { emoji: '😨', label: 'Scared', correct: false, scorePoints: 2 },
    ],
  },
  {
    key: 'ch6_emotion_3', chapter: 2, level: 1, mechanic: 'grid_select',
    domain: 'social_communication', label: 'Emotion Match – Angry',
    emoji: '😠',
    prompt: 'Which feeling is this face showing?',
    options: [
      { emoji: '😊', label: 'Happy',  correct: false, scorePoints: 2 },
      { emoji: '😢', label: 'Sad',    correct: false, scorePoints: 2 },
      { emoji: '😠', label: 'Angry',  correct: true,  scorePoints: 0 },
      { emoji: '😨', label: 'Scared', correct: false, scorePoints: 2 },
    ],
  },
  {
    key: 'ch6_emotion_4', chapter: 2, level: 1, mechanic: 'grid_select',
    domain: 'social_communication', label: 'Emotion Match – Scared',
    emoji: '😨',
    prompt: 'Which feeling is this face showing?',
    options: [
      { emoji: '😊', label: 'Happy',  correct: false, scorePoints: 2 },
      { emoji: '😢', label: 'Sad',    correct: false, scorePoints: 2 },
      { emoji: '😠', label: 'Angry',  correct: false, scorePoints: 2 },
      { emoji: '😨', label: 'Scared', correct: true,  scorePoints: 0 },
    ],
  },
  {
    key: 'ch6_emotion_5', chapter: 2, level: 1, mechanic: 'grid_select',
    domain: 'social_communication', label: 'Emotion Match – Scenario',
    emoji: '🎂🎉',
    prompt: "It's my birthday! How do I feel?",
    options: [
      { emoji: '😊', label: 'Happy',  correct: true,  scorePoints: 0 },
      { emoji: '😢', label: 'Sad',    correct: false, scorePoints: 2 },
      { emoji: '😠', label: 'Angry',  correct: false, scorePoints: 2 },
      { emoji: '😨', label: 'Scared', correct: false, scorePoints: 2 },
    ],
  },
  {
    key: 'ch6_emotion_6', chapter: 2, level: 1, mechanic: 'grid_select',
    domain: 'social_communication', label: 'Emotion Match – Sad Scenario',
    emoji: '🧸💔',
    prompt: 'My favourite toy broke. How do I feel?',
    options: [
      { emoji: '😊', label: 'Happy',  correct: false, scorePoints: 2 },
      { emoji: '😢', label: 'Sad',    correct: true,  scorePoints: 0 },
      { emoji: '😠', label: 'Angry',  correct: false, scorePoints: 2 },
      { emoji: '😨', label: 'Scared', correct: false, scorePoints: 2 },
    ],
  },

  // ── Chapter 2 – Expression Mirror ────────────────────────────────────────
  {
    key: 'ch6_mirror_1', chapter: 2, level: 2, mechanic: 'grid_select',
    domain: 'social_communication', label: 'Expression Mirror – Happy',
    emoji: '😄',
    prompt: 'Tap the face that matches: HAPPY',
    options: [
      { emoji: '😄', label: 'Very happy', correct: true,  scorePoints: 0 },
      { emoji: '🙂', label: 'A bit happy',correct: false, scorePoints: 1 },
      { emoji: '😐', label: 'Neutral',    correct: false, scorePoints: 2 },
      { emoji: '😢', label: 'Sad',        correct: false, scorePoints: 3 },
    ],
  },
  {
    key: 'ch6_mirror_2', chapter: 2, level: 2, mechanic: 'grid_select',
    domain: 'social_communication', label: 'Expression Mirror – Sad',
    emoji: '😢',
    prompt: 'Tap the face that matches: SAD',
    options: [
      { emoji: '😢', label: 'Sad',        correct: true,  scorePoints: 0 },
      { emoji: '😟', label: 'A bit sad',  correct: false, scorePoints: 1 },
      { emoji: '😐', label: 'Neutral',    correct: false, scorePoints: 2 },
      { emoji: '😄', label: 'Happy',      correct: false, scorePoints: 3 },
    ],
  },
  {
    key: 'ch6_mirror_3', chapter: 2, level: 2, mechanic: 'grid_select',
    domain: 'social_communication', label: 'Expression Mirror – Scared',
    emoji: '😨',
    prompt: 'Tap the face that matches: SCARED',
    options: [
      { emoji: '😨', label: 'Scared',     correct: true,  scorePoints: 0 },
      { emoji: '😰', label: 'Very scared',correct: false, scorePoints: 1 },
      { emoji: '😐', label: 'Neutral',    correct: false, scorePoints: 2 },
      { emoji: '😄', label: 'Happy',      correct: false, scorePoints: 3 },
    ],
  },

  // ── Chapter 2 – Regulation ───────────────────────────────────────────────
  {
    key: 'ch6_regulate_1', chapter: 2, level: 3, mechanic: 'scenario_choice',
    domain: 'social_communication', label: 'Regulation – Ice Cream',
    emoji: '🍦😱',
    prompt: 'Oh no! My ice cream fell on the floor. What do I do?',
    options: [
      { label: "😔 It's okay, accidents happen!", type: 'appropriate', scorePoints: 0 },
      { label: '🙈 Say nothing and walk away',     type: 'avoidant',    scorePoints: 2 },
      { label: '💢 Scream and cry loudly!',        type: 'aggressive',  scorePoints: 3 },
    ],
  },
  {
    key: 'ch6_regulate_2', chapter: 2, level: 3, mechanic: 'scenario_choice',
    domain: 'social_communication', label: 'Regulation – Toy Taken',
    emoji: '🧸👋',
    prompt: 'Someone took my favourite toy. What do I do?',
    options: [
      { label: '🗣️ Tell an adult about it',  type: 'appropriate', scorePoints: 0 },
      { label: '🏃 Walk away and ignore it', type: 'avoidant',    scorePoints: 2 },
      { label: '👊 Push them hard!',         type: 'aggressive',  scorePoints: 3 },
    ],
  },
  {
    key: 'ch6_regulate_3', chapter: 2, level: 3, mechanic: 'scenario_choice',
    domain: 'social_communication', label: 'Regulation – Loud Noise',
    emoji: '🔊😖',
    prompt: 'There is a very loud noise outside. What do I do?',
    options: [
      { label: '🙉 Cover ears and take a breath', type: 'appropriate', scorePoints: 0 },
      { label: '🚪 Hide under the bed',           type: 'avoidant',    scorePoints: 2 },
      { label: '😡 Yell at everyone nearby',      type: 'aggressive',  scorePoints: 3 },
    ],
  },

  // ── Chapter 3 – Greeting ─────────────────────────────────────────────────
  {
    key: 'ch6_greeting_1', chapter: 3, level: 1, mechanic: 'tap_target',
    domain: 'social_communication', label: 'Greeting Sequence',
    emoji: '👋',
    prompt: 'A friend is at the door! Wave hello!',
    options: [],
  },

  // ── Chapter 3 – Conversation ──────────────────────────────────────────────
  {
    key: 'ch6_convo_1', chapter: 3, level: 2, mechanic: 'scenario_choice',
    domain: 'social_communication', label: 'Conversation A',
    emoji: '👧',
    prompt: '"Hi! Do you want to play with me?"',
    options: [
      { label: '😊 Yes please! That sounds fun!', type: 'appropriate', scorePoints: 0 },
      { label: '🚂 I like trains.',               type: 'literal',     scorePoints: 2 },
      { label: '🌤️ The sky has clouds.',          type: 'off_topic',   scorePoints: 3 },
    ],
  },
  {
    key: 'ch6_convo_2', chapter: 3, level: 2, mechanic: 'scenario_choice',
    domain: 'social_communication', label: 'Conversation B',
    emoji: '👦',
    prompt: '"I feel a bit sad today…"',
    options: [
      { label: '🤗 Are you okay? What happened?',  type: 'appropriate', scorePoints: 0 },
      { label: '🧠 Sadness is a brain chemical.',  type: 'literal',     scorePoints: 2 },
      { label: '🍪 I like cookies!',               type: 'off_topic',   scorePoints: 3 },
    ],
  },
  {
    key: 'ch6_convo_3', chapter: 3, level: 2, mechanic: 'scenario_choice',
    domain: 'social_communication', label: 'Conversation C',
    emoji: '👧',
    prompt: '"I\'m building a tower. Can you help me?"',
    options: [
      { label: "🏗️ Sure, let's build together!",  type: 'appropriate', scorePoints: 0 },
      { label: '📏 Towers can fall down.',         type: 'literal',     scorePoints: 2 },
      { label: '🍕 I had pizza yesterday.',        type: 'off_topic',   scorePoints: 3 },
    ],
  },

  // ── Chapter 3 – Sharing ───────────────────────────────────────────────────
  {
    key: 'ch6_share_1', chapter: 3, level: 3, mechanic: 'scenario_choice',
    domain: 'social_communication', label: 'Sharing A',
    emoji: '🎨',
    prompt: 'You found some crayons! Your friend is nearby. What do you do?',
    options: [
      { label: '🎁 Share them with your friend!', type: 'share',  scorePoints: 0 },
      { label: '🤐 Keep them all for yourself.',  type: 'keep',   scorePoints: 2 },
      { label: '🏃 Run away quickly.',            type: 'ignore', scorePoints: 3 },
    ],
  },
  {
    key: 'ch6_share_2', chapter: 3, level: 3, mechanic: 'tap_target',
    domain: 'social_communication', label: 'Joint Attention B',
    emoji: '⭐',
    prompt: 'Friend found something shiny and is pointing at it! Tap what they see!',
    options: [],
  },

  // ── Chapter 3 – Imitation ─────────────────────────────────────────────────
  {
    key: 'ch6_imitate_1', chapter: 3, level: 4, mechanic: 'grid_select',
    domain: 'social_communication', label: 'Copy Cat – Wave',
    emoji: '👋',
    prompt: 'The guide is waving. Which action is this?',
    options: [
      { emoji: '👊', label: 'Punch',  correct: false, scorePoints: 1 },
      { emoji: '👏', label: 'Clap',   correct: false, scorePoints: 1 },
      { emoji: '👋', label: 'Wave',   correct: true,  scorePoints: 0 },
      { emoji: '🤚', label: 'Stop',   correct: false, scorePoints: 1 },
    ],
  },
  {
    key: 'ch6_imitate_2', chapter: 3, level: 4, mechanic: 'grid_select',
    domain: 'social_communication', label: 'Copy Cat – Big Smile',
    emoji: '😁',
    prompt: 'The guide is making a big smile. Which face is this?',
    options: [
      { emoji: '😁', label: 'Big smile', correct: true,  scorePoints: 0 },
      { emoji: '😐', label: 'Neutral',   correct: false, scorePoints: 2 },
      { emoji: '😯', label: 'Surprised', correct: false, scorePoints: 2 },
      { emoji: '😟', label: 'Worried',   correct: false, scorePoints: 2 },
    ],
  },
  {
    key: 'ch6_imitate_3', chapter: 3, level: 4, mechanic: 'grid_select',
    domain: 'social_communication', label: 'Copy Cat – Clap',
    emoji: '👏',
    prompt: 'The guide is clapping. Which action is this?',
    options: [
      { emoji: '👏', label: 'Clap',   correct: true,  scorePoints: 0 },
      { emoji: '🤙', label: 'Call',   correct: false, scorePoints: 1 },
      { emoji: '✌️', label: 'Peace',  correct: false, scorePoints: 1 },
      { emoji: '👐', label: 'Open',   correct: false, scorePoints: 1 },
    ],
  },
  {
    key: 'ch6_imitate_4', chapter: 3, level: 4, mechanic: 'grid_select',
    domain: 'social_communication', label: 'Copy Cat – Drink',
    emoji: '🥤',
    prompt: 'The guide is pretending to drink. What are they using?',
    options: [
      { emoji: '🍽️', label: 'Plate',  correct: false, scorePoints: 1 },
      { emoji: '🥤', label: 'Cup',    correct: true,  scorePoints: 0 },
      { emoji: '🧴', label: 'Bottle', correct: false, scorePoints: 1 },
      { emoji: '🖊️', label: 'Pen',    correct: false, scorePoints: 1 },
    ],
  },

  // ── Chapter 4 – Routine Sort ──────────────────────────────────────────────
  {
    key: 'ch6_routine_1', chapter: 4, level: 1, mechanic: 'drag_sort',
    domain: 'restricted_repetitive', label: 'Routine Sort A',
    emoji: '📋',
    prompt: 'Put these 3 morning steps in the right order!',
    options: [
      { id: 'teeth',     emoji: '🦷', label: 'Brush Teeth', correctPos: 0 },
      { id: 'dress',     emoji: '👕', label: 'Get Dressed',  correctPos: 1 },
      { id: 'breakfast', emoji: '🥣', label: 'Breakfast',    correctPos: 2 },
    ],
  },
  {
    key: 'ch6_routine_2', chapter: 4, level: 1, mechanic: 'drag_sort',
    domain: 'restricted_repetitive', label: 'Routine Sort B',
    emoji: '📋',
    prompt: 'Put these 3 steps in the right order!',
    options: [
      { id: 'wake', emoji: '⏰', label: 'Wake Up',      correctPos: 0 },
      { id: 'pack', emoji: '🎒', label: 'Pack Bag',     correctPos: 1 },
      { id: 'shoes', emoji: '👟', label: 'Put on Shoes', correctPos: 2 },
    ],
  },

  // ── Chapter 4 – Flexibility ───────────────────────────────────────────────
  {
    key: 'ch6_flexible_1', chapter: 4, level: 2, mechanic: 'scenario_choice',
    domain: 'restricted_repetitive', label: 'Flexibility Challenge A',
    emoji: '🚧',
    prompt: 'The path to the park is blocked! You can\'t go that way.',
    options: [
      { label: '🗺️ Let\'s find another way!',  type: 'flexible', scorePoints: 0 },
      { label: '😢 I\'m upset but okay…',      type: 'distress', scorePoints: 2 },
      { label: '😡 I MUST go that exact way!', type: 'rigid',    scorePoints: 3 },
    ],
  },
  {
    key: 'ch6_flexible_2', chapter: 4, level: 2, mechanic: 'scenario_choice',
    domain: 'restricted_repetitive', label: 'Flexibility Challenge B',
    emoji: '🌧️',
    prompt: "It's raining! The outdoor picnic is cancelled.",
    options: [
      { label: '🏠 Let\'s have a picnic inside!', type: 'flexible', scorePoints: 0 },
      { label: '😢 I\'m really disappointed…',    type: 'distress', scorePoints: 2 },
      { label: '😤 We HAVE to go outside!',        type: 'rigid',    scorePoints: 3 },
    ],
  },
  {
    key: 'ch6_flexible_3', chapter: 4, level: 2, mechanic: 'scenario_choice',
    domain: 'restricted_repetitive', label: 'Flexibility Challenge C',
    emoji: '🤷',
    prompt: 'Your favourite food is sold out today!',
    options: [
      { label: '🍕 I\'ll try something else!',  type: 'flexible', scorePoints: 0 },
      { label: '😟 That makes me really sad…',  type: 'distress', scorePoints: 2 },
      { label: '😠 I only eat THAT food!',      type: 'rigid',    scorePoints: 3 },
    ],
  },

  // ── Chapter 4 – Pattern Detective ────────────────────────────────────────
  {
    key: 'ch6_pattern_1', chapter: 4, level: 3, mechanic: 'grid_select',
    domain: 'restricted_repetitive', label: 'Pattern Detective A',
    emoji: '🔴🔵',
    prompt: 'What comes next? 🔴🔵🔴🔵🔴 ___',
    options: [
      { emoji: '🔵', label: 'Blue',    correct: true,  scorePoints: 0 },
      { emoji: '🔴', label: 'Red',     correct: false, scorePoints: 2 },
      { emoji: '⭐', label: 'Star',    correct: false, scorePoints: 2 },
      { emoji: '🟢', label: 'Green',   correct: false, scorePoints: 2 },
    ],
  },
  {
    key: 'ch6_pattern_2', chapter: 4, level: 3, mechanic: 'grid_select',
    domain: 'restricted_repetitive', label: 'Pattern Detective B',
    emoji: '⭐🌙',
    prompt: 'What comes next? ⭐🌙☀️⭐🌙 ___',
    options: [
      { emoji: '⭐', label: 'Star',    correct: false, scorePoints: 2 },
      { emoji: '☀️', label: 'Sun',     correct: true,  scorePoints: 0 },
      { emoji: '🌙', label: 'Moon',    correct: false, scorePoints: 2 },
      { emoji: '💧', label: 'Drop',    correct: false, scorePoints: 2 },
    ],
  },
  {
    key: 'ch6_pattern_3', chapter: 4, level: 3, mechanic: 'grid_select',
    domain: 'restricted_repetitive', label: 'Pattern Detective C',
    emoji: '🟥🟦',
    prompt: 'What comes next? 🟥🟥🟦🟦🟩 ___',
    options: [
      { emoji: '🟥', label: 'Red',     correct: false, scorePoints: 2 },
      { emoji: '🟦', label: 'Blue',    correct: false, scorePoints: 2 },
      { emoji: '🟩', label: 'Green',   correct: true,  scorePoints: 0 },
      { emoji: '🟪', label: 'Purple',  correct: false, scorePoints: 2 },
    ],
  },

  // ── Chapter 4 – Special Interests ────────────────────────────────────────
  {
    key: 'ch6_interest_1', chapter: 4, level: 4, mechanic: 'tap_target',
    domain: 'restricted_repetitive', label: 'Special Interests – Trains',
    emoji: '🚂',
    prompt: '🚂 Trains run on metal rails! Tap to learn more!',
    options: [],
  },
  {
    key: 'ch6_interest_2', chapter: 4, level: 4, mechanic: 'tap_target',
    domain: 'restricted_repetitive', label: 'Special Interests – Space',
    emoji: '🌌',
    prompt: '🌌 There are 2 trillion galaxies! Tap to explore!',
    options: [],
  },

  // ── Chapter 5 – Pretend Play Recognition ─────────────────────────────────
  {
    key: 'ch6_pretend_1', chapter: 5, level: 1, mechanic: 'scenario_choice',
    domain: 'pretend_play', label: 'Pretend Recognition A',
    emoji: '🍌📞',
    prompt: 'Someone is using a banana like a phone! What are they doing?',
    options: [
      { label: '🎭 They\'re pretending!',      type: 'pretend',  scorePoints: 0 },
      { label: '📌 That\'s just a banana.',    type: 'literal',  scorePoints: 2 },
      { label: '🤔 I\'m not sure at all.',     type: 'unsure',   scorePoints: 1 },
    ],
  },
  {
    key: 'ch6_pretend_2', chapter: 5, level: 1, mechanic: 'scenario_choice',
    domain: 'pretend_play', label: 'Pretend Recognition B',
    emoji: '🧸🥄',
    prompt: 'Someone is pretending to feed their teddy bear soup! What are they doing?',
    options: [
      { label: '🎭 They\'re pretending!',        type: 'pretend',  scorePoints: 0 },
      { label: '📌 Teddy can\'t eat real soup.', type: 'literal',  scorePoints: 2 },
      { label: '🤔 I\'m not sure.',              type: 'unsure',   scorePoints: 1 },
    ],
  },
  {
    key: 'ch6_pretend_3', chapter: 5, level: 1, mechanic: 'scenario_choice',
    domain: 'pretend_play', label: 'Pretend Recognition C',
    emoji: '🧱🚗',
    prompt: 'Someone is pushing a block and making "vroom" noises! What are they doing?',
    options: [
      { label: '🎭 They\'re pretending it\'s a car!', type: 'pretend', scorePoints: 0 },
      { label: '📌 That\'s just a block.',            type: 'literal', scorePoints: 2 },
      { label: '🤔 I\'m not sure.',                   type: 'unsure',  scorePoints: 1 },
    ],
  },

  // ── Chapter 5 – Create Pretend ────────────────────────────────────────────
  {
    key: 'ch6_create_1', chapter: 5, level: 2, mechanic: 'tap_target',
    domain: 'pretend_play', label: 'Pretend World – Tea Party',
    emoji: '🫖',
    prompt: '☕ Tea Party time! Tap something to use in your pretend tea party!',
    options: [],
  },
  {
    key: 'ch6_create_2', chapter: 5, level: 2, mechanic: 'tap_target',
    domain: 'pretend_play', label: 'Pretend World – Superheroes',
    emoji: '🦸',
    prompt: '🦸 Superhero adventure! Tap something for your hero to use!',
    options: [],
  },

  // ── Chapter 5 – Sensory ───────────────────────────────────────────────────
  {
    key: 'ch6_sensory_1', chapter: 5, level: 3, mechanic: 'scenario_choice',
    domain: 'sensory_processing', label: 'Sensory – Birds',
    emoji: '🐦',
    prompt: 'You hear birds chirping outside. How does it make you feel?',
    options: [
      { label: '😊 I love it! So peaceful.',      type: 'happy',   scorePoints: 0 },
      { label: '😟 It makes me a bit worried.',   type: 'worried', scorePoints: 1 },
      { label: '🙉 It\'s too loud! Cover ears!',  type: 'cover',   scorePoints: 2 },
    ],
  },
  {
    key: 'ch6_sensory_2', chapter: 5, level: 3, mechanic: 'scenario_choice',
    domain: 'sensory_processing', label: 'Sensory – Thunder',
    emoji: '⚡',
    prompt: 'You hear a loud thunder crack! How does it make you feel?',
    options: [
      { label: '😐 It\'s okay, just thunder.',    type: 'neutral', scorePoints: 0 },
      { label: '😢 It upsets me a lot.',          type: 'upset',   scorePoints: 2 },
      { label: '🚪 I want to leave the room!',    type: 'leave',   scorePoints: 3 },
    ],
  },
  {
    key: 'ch6_sensory_3', chapter: 5, level: 3, mechanic: 'scenario_choice',
    domain: 'sensory_processing', label: 'Sensory – Bright Lights',
    emoji: '🌈',
    prompt: 'The room has very bright colourful lights. How does it make you feel?',
    options: [
      { label: '😊 I love the bright colours!',   type: 'happy',   scorePoints: 0 },
      { label: '😟 It makes me feel a bit dizzy.', type: 'worried', scorePoints: 1 },
      { label: '🙈 I don\'t like it — too much!',  type: 'cover',   scorePoints: 2 },
    ],
  },
  {
    key: 'ch6_sensory_4', chapter: 5, level: 3, mechanic: 'scenario_choice',
    domain: 'sensory_processing', label: 'Sensory – Texture Rough',
    emoji: '🟤',
    prompt: 'You touch something with a rough, scratchy texture. How does it make you feel?',
    options: [
      { label: '😊 That\'s interesting!',         type: 'happy',   scorePoints: 0 },
      { label: '😐 It\'s fine, not a problem.',   type: 'neutral', scorePoints: 0 },
      { label: '✋ I won\'t touch that!',          type: 'no_touch',scorePoints: 2 },
    ],
  },

  // ── Extra variety tasks ───────────────────────────────────────────────────
  {
    key: 'ch6_extra_1', chapter: 2, level: 1, mechanic: 'grid_select',
    domain: 'social_communication', label: 'Emotion – Dog Happy',
    emoji: '🐶',
    prompt: 'This dog looks really happy! What feeling is this?',
    options: [
      { emoji: '😊', label: 'Happy',  correct: true,  scorePoints: 0 },
      { emoji: '😢', label: 'Sad',    correct: false, scorePoints: 2 },
      { emoji: '😠', label: 'Angry',  correct: false, scorePoints: 2 },
      { emoji: '😨', label: 'Scared', correct: false, scorePoints: 2 },
    ],
  },
  {
    key: 'ch6_extra_2', chapter: 2, level: 1, mechanic: 'grid_select',
    domain: 'social_communication', label: 'Emotion – Angry Scenario',
    emoji: '👧😡',
    prompt: 'Someone keeps pushing me! How do I feel?',
    options: [
      { emoji: '😊', label: 'Happy',  correct: false, scorePoints: 2 },
      { emoji: '😢', label: 'Sad',    correct: false, scorePoints: 1 },
      { emoji: '😠', label: 'Angry',  correct: true,  scorePoints: 0 },
      { emoji: '😨', label: 'Scared', correct: false, scorePoints: 2 },
    ],
  },
  {
    key: 'ch6_extra_3', chapter: 4, level: 3, mechanic: 'grid_select',
    domain: 'restricted_repetitive', label: 'Pattern Detective D',
    emoji: '🔵🟢',
    prompt: 'What comes next? 🔵🟢🔵🟢🔵 ___',
    options: [
      { emoji: '🔵', label: 'Blue',   correct: false, scorePoints: 2 },
      { emoji: '🟢', label: 'Green',  correct: true,  scorePoints: 0 },
      { emoji: '🟡', label: 'Yellow', correct: false, scorePoints: 2 },
      { emoji: '🔴', label: 'Red',    correct: false, scorePoints: 2 },
    ],
  },
  {
    key: 'ch6_extra_4', chapter: 3, level: 2, mechanic: 'scenario_choice',
    domain: 'social_communication', label: 'Conversation D',
    emoji: '👦',
    prompt: '"Thanks for playing! See you tomorrow?"',
    options: [
      { label: "😊 Yes! I'd really like that!", type: 'appropriate', scorePoints: 0 },
      { label: '📅 Tomorrow is Wednesday.',     type: 'literal',     scorePoints: 2 },
      { label: '💧 I need some water.',         type: 'off_topic',   scorePoints: 3 },
    ],
  },
  {
    key: 'ch6_extra_5', chapter: 5, level: 1, mechanic: 'scenario_choice',
    domain: 'pretend_play', label: 'Pretend Recognition D',
    emoji: '🫗😊',
    prompt: 'Someone is drinking from an empty cup! What are they doing?',
    options: [
      { label: '🎭 They\'re pretending to drink!', type: 'pretend', scorePoints: 0 },
      { label: '📌 The cup is empty.',             type: 'literal', scorePoints: 2 },
      { label: '🤔 I\'m not sure.',                type: 'unsure',  scorePoints: 1 },
    ],
  },
  {
    key: 'ch6_extra_6', chapter: 2, level: 3, mechanic: 'scenario_choice',
    domain: 'social_communication', label: 'Regulation – Broken Toy',
    emoji: '🧸💔',
    prompt: 'My toy is broken and I can\'t fix it. What do I do?',
    options: [
      { label: '😌 It\'s okay, things break.',   type: 'appropriate', scorePoints: 0 },
      { label: '🛏️ Lie down and ignore it.',     type: 'avoidant',    scorePoints: 2 },
      { label: '🗑️ Break it even more!',          type: 'aggressive',  scorePoints: 3 },
    ],
  },
  {
    key: 'ch6_extra_7', chapter: 3, level: 4, mechanic: 'grid_select',
    domain: 'social_communication', label: 'Copy Cat – Wink',
    emoji: '😉',
    prompt: 'The guide is winking. Which face is this?',
    options: [
      { emoji: '😠', label: 'Angry',  correct: false, scorePoints: 2 },
      { emoji: '😉', label: 'Wink',   correct: true,  scorePoints: 0 },
      { emoji: '😢', label: 'Sad',    correct: false, scorePoints: 2 },
      { emoji: '😊', label: 'Happy',  correct: false, scorePoints: 2 },
    ],
  },
  {
    key: 'ch6_extra_8', chapter: 4, level: 2, mechanic: 'scenario_choice',
    domain: 'restricted_repetitive', label: 'Flexibility Challenge D',
    emoji: '🎠',
    prompt: "You've been on the swings many times. Your friend wants to try the slide!",
    options: [
      { label: '🛝 Sure! Let\'s try the slide!',  type: 'flexible', scorePoints: 0 },
      { label: '😟 I really want the swings…',    type: 'distress', scorePoints: 2 },
      { label: '😠 Only the swings! Nothing else!', type: 'rigid',  scorePoints: 3 },
    ],
  },
  {
    key: 'ch6_extra_9', chapter: 5, level: 3, mechanic: 'scenario_choice',
    domain: 'sensory_processing', label: 'Sensory – Water',
    emoji: '💧',
    prompt: 'Your hands get wet and splashed with water! How does it make you feel?',
    options: [
      { label: '😊 Fun! I love water!',           type: 'happy',    scorePoints: 0 },
      { label: '😐 It\'s fine, not a big deal.',  type: 'neutral',  scorePoints: 0 },
      { label: '✋ I don\'t want to touch it!',   type: 'no_touch', scorePoints: 2 },
    ],
  },
  {
    key: 'ch6_extra_10', chapter: 3, level: 3, mechanic: 'scenario_choice',
    domain: 'social_communication', label: 'Sharing C',
    emoji: '🍬',
    prompt: 'You found some sweets! Your friend sees them. What do you do?',
    options: [
      { label: '🎁 Share some with your friend!', type: 'share',  scorePoints: 0 },
      { label: '🤐 Keep them all for yourself.',  type: 'keep',   scorePoints: 2 },
      { label: '🏃 Hide them quickly.',           type: 'ignore', scorePoints: 3 },
    ],
  },
];

const SAMPLE_SIZE = 15;

/**
 * Seeded LCG pseudo-random number generator.
 * Produces a deterministic shuffle for the same sessionId.
 */
function seededRng(seed) {
  let state = 0;
  for (let i = 0; i < seed.length; i++) {
    state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/**
 * Return 15 deterministically sampled tasks from the pool using sessionId as seed.
 * @param {string} sessionId
 * @returns {object[]}
 */
export function sampleTasks(sessionId) {
  const rng = seededRng(sessionId);
  const pool = [...CHAPTER6_TASK_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, SAMPLE_SIZE);
}
