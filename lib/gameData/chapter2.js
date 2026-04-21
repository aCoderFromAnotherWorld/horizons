const emotions = ["happy", "sad", "angry", "scared"];
const subjects = ["child", "adult", "animal"];

export const faceCards = emotions.flatMap((emotion) =>
  subjects.map((subjectType) => ({
    id: `${subjectType}-${emotion}`,
    emotion,
    subjectType,
    imagePath: `/assets/emotions/${subjectType}-${emotion}-2.webp`,
    altText: `${subjectType} ${emotion} face`,
  })),
);

export const scenarioCards = [
  {
    id: "birthday-cake",
    description: "A child gets a birthday cake.",
    correctEmotion: "happy",
    imagePath: "/assets/ui/flower-happy.webp",
  },
  {
    id: "lost-ball",
    description: "A favorite ball rolls away and cannot be found.",
    correctEmotion: "sad",
    imagePath: "/assets/objects/ball.webp",
  },
  {
    id: "toy-grabbed",
    description: "Someone grabs a toy without asking.",
    correctEmotion: "angry",
    imagePath: "/assets/objects/pretend/teddy.webp",
  },
  {
    id: "dark-room",
    description: "A loud sound happens in a dark room.",
    correctEmotion: "scared",
    imagePath: "/assets/objects/sounds-sources/thunder.webp",
  },
  {
    id: "friend-waves",
    description: "A friend smiles and waves hello.",
    correctEmotion: "happy",
    imagePath: "/assets/characters/guides/bunny-wave.webp",
  },
  {
    id: "broken-crayon",
    description: "A special crayon breaks during drawing.",
    correctEmotion: "sad",
    imagePath: "/assets/objects/topics/colors.webp",
  },
  {
    id: "blocked-path",
    description: "The way to the slide is blocked.",
    correctEmotion: "angry",
    imagePath: "/assets/objects/playground/slide.webp",
  },
  {
    id: "big-dog-barks",
    description: "A big dog barks suddenly.",
    correctEmotion: "scared",
    imagePath: "/assets/objects/sounds-sources/dog.webp",
  },
];

function facePath(emotion, intensity = 2, subject = "child") {
  if (emotion === "neutral") return `/assets/emotions/${subject}-neutral.webp`;
  return `/assets/emotions/${subject}-${emotion}-${intensity}.webp`;
}

function buildOptions(emotion, intensity, variantSeed = 0) {
  const targetSubject = subjects[variantSeed % subjects.length];
  const neutralSubject = subjects[(variantSeed + 2) % subjects.length];
  const otherEmotions = emotions.filter((item) => item !== emotion);

  return [
    facePath(emotion, intensity, targetSubject),
    facePath("neutral", 2, neutralSubject),
    ...otherEmotions.map((otherEmotion, index) =>
      facePath(
        otherEmotion,
        index === 0 ? 1 : index === 1 ? 2 : 3,
        subjects[(variantSeed + index + 1) % subjects.length],
      ),
    ),
  ];
}

export const expressionTrials = emotions.flatMap((emotion) =>
  [1, 2, 3, 2].map((intensity, index) => ({
    id: `${emotion}-${index + 1}`,
    emotion,
    intensity,
    voiceAudioPath: null,
    correctFaceIndex: 0,
    options: buildOptions(emotion, intensity, index),
  })),
);

export const regulationScenarios = [
  {
    id: "ice-cream-drops",
    story: "The ice cream falls on the ground.",
    imagePath: "/assets/objects/textures/jello.webp",
    options: [
      { text: "Ask for help and take a breath.", type: "appropriate" },
      { text: "Walk away and hide.", type: "avoidant" },
      { text: "Yell and throw the cone.", type: "aggressive" },
    ],
  },
  {
    id: "toy-taken",
    story: "Another child takes the toy you were using.",
    imagePath: "/assets/objects/pretend/teddy.webp",
    options: [
      { text: "Say, please give it back.", type: "appropriate" },
      { text: "Stop playing and sit alone.", type: "avoidant" },
      { text: "Grab it and push.", type: "aggressive" },
    ],
  },
  {
    id: "loud-noise",
    story: "A sudden loud noise happens nearby.",
    imagePath: "/assets/objects/sounds-sources/thunder.webp",
    options: [
      { text: "Cover ears and ask to move away.", type: "appropriate" },
      { text: "Run away without telling anyone.", type: "avoidant" },
      { text: "Scream at everyone.", type: "aggressive" },
    ],
  },
  {
    id: "lost-item",
    story: "A favorite item is missing.",
    imagePath: "/assets/objects/pretend/box.webp",
    options: [
      { text: "Look carefully and ask for help.", type: "appropriate" },
      { text: "Give up and refuse to continue.", type: "avoidant" },
      { text: "Kick the box.", type: "aggressive" },
    ],
  },
  {
    id: "broken-toy",
    story: "A toy breaks during play.",
    imagePath: "/assets/objects/pretend/block.webp",
    options: [
      { text: "Try fixing it or choose another toy.", type: "appropriate" },
      { text: "Leave the room.", type: "avoidant" },
      { text: "Break another toy.", type: "aggressive" },
    ],
  },
  {
    id: "peer-conflict",
    story: "A friend wants a different game.",
    imagePath: "/assets/characters/guides/cat.webp",
    options: [
      { text: "Take turns choosing games.", type: "appropriate" },
      { text: "Only play alone.", type: "avoidant" },
      { text: "Say mean words.", type: "aggressive" },
    ],
  },
];

const chapter2 = {
  faceCards,
  scenarioCards,
  expressionTrials,
  regulationScenarios,
};

export default chapter2;
