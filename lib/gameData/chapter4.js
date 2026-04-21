export const morningRoutineCards = [
  {
    id: "wake-up",
    label: "Wake Up",
    order: 1,
    imagePath: "/assets/objects/routines/wake-up.webp",
  },
  {
    id: "brush-teeth",
    label: "Brush Teeth",
    order: 2,
    imagePath: "/assets/objects/routines/brush-teeth.webp",
  },
  {
    id: "get-dressed",
    label: "Get Dressed",
    order: 3,
    imagePath: "/assets/objects/routines/get-dressed.webp",
  },
  {
    id: "eat-breakfast",
    label: "Eat Breakfast",
    order: 4,
    imagePath: "/assets/objects/routines/eat-breakfast.webp",
  },
  {
    id: "pack-bag",
    label: "Pack Bag",
    order: 5,
    imagePath: "/assets/objects/routines/pack-bag.webp",
  },
  {
    id: "put-shoes",
    label: "Put On Shoes",
    order: 6,
    imagePath: "/assets/objects/routines/put-shoes.webp",
  },
];

export const routineDisruptionScenarios = [
  {
    id: "clean-shirt-wash",
    story: "Oh no! The clean shirt is in the wash.",
    options: [
      { text: "Wear a different shirt.", type: "flexible" },
      { text: "I can't get dressed now.", type: "rigid" },
      { text: "Cry and refuse to continue.", type: "distress" },
    ],
  },
  {
    id: "toothpaste-empty",
    story: "The toothpaste tube is empty.",
    options: [
      { text: "Ask for another tube.", type: "flexible" },
      { text: "No brushing today.", type: "rigid" },
      { text: "Throw the toothbrush.", type: "distress" },
    ],
  },
  {
    id: "missing-shoe",
    story: "One shoe is missing.",
    options: [
      { text: "Look for it or choose another pair.", type: "flexible" },
      { text: "I only wear that pair.", type: "rigid" },
      { text: "Scream and stop.", type: "distress" },
    ],
  },
  {
    id: "breakfast-changed",
    story: "The usual cereal is finished.",
    options: [
      { text: "Try toast instead.", type: "flexible" },
      { text: "I must have cereal.", type: "rigid" },
      { text: "Push the bowl away.", type: "distress" },
    ],
  },
];

export const playgroundActivities = [
  {
    id: "slide",
    label: "Slide",
    imagePath: "/assets/objects/playground/slide.webp",
  },
  {
    id: "swings",
    label: "Swings",
    imagePath: "/assets/objects/playground/swings.webp",
  },
  {
    id: "sandbox",
    label: "Sandbox",
    imagePath: "/assets/objects/playground/sandbox.webp",
  },
  {
    id: "climbing-frame",
    label: "Climbing Frame",
    imagePath: "/assets/objects/playground/climbing-frame.webp",
  },
  {
    id: "see-saw",
    label: "See-saw",
    imagePath: "/assets/objects/playground/see-saw.webp",
  },
];

export const unexpectedEventScenarios = [
  {
    id: "path-blocked",
    story: "The path is blocked by construction.",
    imagePath: "/assets/backgrounds/unexpected-events.webp",
    responses: [
      { text: "Find another path.", type: "flexible" },
      { text: "Sit down and feel upset.", type: "distress" },
      { text: "I refuse to go another way.", type: "rigid" },
    ],
  },
  {
    id: "library-closed",
    story: "The library is closed today.",
    imagePath: "/assets/backgrounds/library.webp",
    responses: [
      { text: "Choose a book at home.", type: "flexible" },
      { text: "Cry at the door.", type: "distress" },
      { text: "It must be open now.", type: "rigid" },
    ],
  },
  {
    id: "food-sold-out",
    story: "The favorite food is sold out.",
    imagePath: "/assets/objects/routines/eat-breakfast.webp",
    responses: [
      { text: "Pick a different snack.", type: "flexible" },
      { text: "Get very upset.", type: "distress" },
      { text: "I won't eat anything else.", type: "rigid" },
    ],
  },
  {
    id: "rain-cancels-plan",
    story: "Rain cancels the outdoor plan.",
    imagePath: "/assets/objects/sounds-sources/thunder.webp",
    responses: [
      { text: "Play something inside.", type: "flexible" },
      { text: "Hide and cry.", type: "distress" },
      { text: "The plan cannot change.", type: "rigid" },
    ],
  },
];

const chapter4 = {
  morningRoutineCards,
  routineDisruptionScenarios,
  playgroundActivities,
  unexpectedEventScenarios,
};

export default chapter4;
