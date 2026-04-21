export const greetingSteps = [
  {
    id: "knock",
    label: "Knock on the door",
    timeoutMs: 5000,
    prompt: "Tap the door knocker.",
  },
  {
    id: "wave_smile",
    label: "Wave and smile",
    timeoutMs: 5000,
    prompt: "Wave back to your friend.",
  },
  {
    id: "eye_contact",
    label: "Look at your friend",
    timeoutMs: 5000,
    prompt: "Tap your friend's face.",
  },
];

export const conversationExchanges = [
  {
    id: "hello",
    friendSays: "Hi! I'm happy you came over.",
    options: [
      { text: "Hi! I'm happy too.", type: "social" },
      { text: "Your door is blue.", type: "factual" },
      { text: "Trains have wheels.", type: "off-topic" },
    ],
  },
  {
    id: "favorite-game",
    friendSays: "What game should we play first?",
    options: [
      { text: "Let's choose together.", type: "social" },
      { text: "The blocks are rectangles.", type: "factual" },
      { text: "Only dinosaur facts.", type: "off-topic" },
      { text: "You said game, so we must play a game.", type: "literal" },
    ],
  },
  {
    id: "friend-sad",
    friendSays: "My toy broke and I feel sad.",
    options: [
      { text: "I'm sorry. I can help.", type: "social" },
      { text: "It has three pieces.", type: "factual" },
      { text: "Cars are faster than toys.", type: "off-topic" },
    ],
  },
  {
    id: "snack",
    friendSays: "Would you like a snack?",
    options: [
      { text: "Yes, thank you.", type: "social" },
      { text: "Snacks go in bowls.", type: "factual" },
      { text: "The train station is loud.", type: "off-topic" },
    ],
  },
  {
    id: "share",
    friendSays: "Can I use the red block too?",
    options: [
      { text: "Sure, let's share.", type: "social" },
      { text: "The block is red.", type: "factual" },
      { text: "Red means stop signs.", type: "literal" },
    ],
  },
  {
    id: "look",
    friendSays: "Look at this cool picture!",
    options: [
      { text: "Wow, I see it!", type: "social" },
      { text: "It is on paper.", type: "factual" },
      { text: "My favorite topic is rockets.", type: "off-topic" },
    ],
  },
  {
    id: "turn",
    friendSays: "It's your turn after mine.",
    options: [
      { text: "Okay, I'll wait.", type: "social" },
      { text: "A turn means rotating.", type: "literal" },
      { text: "There are two turns.", type: "factual" },
    ],
  },
  {
    id: "bye",
    friendSays: "That was fun. Thanks for playing!",
    options: [
      { text: "I had fun too.", type: "social" },
      { text: "We played for many minutes.", type: "factual" },
      { text: "Dinosaurs lived long ago.", type: "off-topic" },
    ],
  },
];

export const discoveryEvents = [
  {
    id: "friend-slide",
    type: "friend_finds",
    object: {
      id: "slide",
      label: "Slide",
      imagePath: "/assets/objects/playground/slide.webp",
      position: "left-[16%] top-[22%]",
    },
  },
  {
    id: "child-ball",
    type: "child_finds",
    object: {
      id: "ball",
      label: "Ball",
      imagePath: "/assets/objects/ball.webp",
      position: "right-[18%] top-[28%]",
    },
    shareOptions: [
      { text: "Show friend!", action: "share" },
      { text: "Keep to myself", action: "keep" },
      { text: "It is round.", action: "factual_detail" },
    ],
  },
  {
    id: "friend-swings",
    type: "friend_finds",
    object: {
      id: "swings",
      label: "Swings",
      imagePath: "/assets/objects/playground/swings.webp",
      position: "left-[45%] top-[18%]",
    },
  },
  {
    id: "child-book",
    type: "child_finds",
    object: {
      id: "book",
      label: "Book",
      imagePath: "/assets/objects/book.webp",
      position: "right-[28%] bottom-[20%]",
    },
    shareOptions: [
      { text: "Show friend!", action: "share" },
      { text: "Keep to myself", action: "keep" },
      { text: "It has pages.", action: "factual_detail" },
    ],
  },
  {
    id: "friend-plant",
    type: "friend_finds",
    object: {
      id: "plant",
      label: "Plant",
      imagePath: "/assets/objects/plant.webp",
      position: "left-[24%] bottom-[18%]",
    },
  },
];

const chapter3 = {
  greetingSteps,
  conversationExchanges,
  discoveryEvents,
};

export default chapter3;
