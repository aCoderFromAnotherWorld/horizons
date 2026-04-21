const shapeLibrary = {
  redCircle: {
    id: "red-circle",
    label: "Red circle",
    shape: "circle",
    color: "red",
    imagePath: "/assets/objects/patterns/circle-red.svg",
  },
  blueCircle: {
    id: "blue-circle",
    label: "Blue circle",
    shape: "circle",
    color: "blue",
    imagePath: "/assets/objects/patterns/circle-blue.svg",
  },
  yellowCircle: {
    id: "yellow-circle",
    label: "Yellow circle",
    shape: "circle",
    color: "yellow",
    imagePath: "/assets/objects/patterns/circle-yellow.svg",
  },
  redSquare: {
    id: "red-square",
    label: "Red square",
    shape: "square",
    color: "red",
    imagePath: "/assets/objects/patterns/square-red.svg",
  },
  blueSquare: {
    id: "blue-square",
    label: "Blue square",
    shape: "square",
    color: "blue",
    imagePath: "/assets/objects/patterns/square-blue.svg",
  },
  greenSquare: {
    id: "green-square",
    label: "Green square",
    shape: "square",
    color: "green",
    imagePath: "/assets/objects/patterns/square-green.svg",
  },
  redTriangle: {
    id: "red-triangle",
    label: "Red triangle",
    shape: "triangle",
    color: "red",
    imagePath: "/assets/objects/patterns/triangle-red.svg",
  },
  blueTriangle: {
    id: "blue-triangle",
    label: "Blue triangle",
    shape: "triangle",
    color: "blue",
    imagePath: "/assets/objects/patterns/triangle-blue.svg",
  },
  yellowStar: {
    id: "yellow-star",
    label: "Yellow star",
    shape: "star",
    color: "yellow",
    imagePath: "/assets/objects/patterns/star-yellow.svg",
  },
};

export const patternSequences = [
  {
    id: "ab",
    label: "AB Pattern",
    missingCount: 2,
    sequence: [
      shapeLibrary.redCircle,
      shapeLibrary.blueSquare,
      shapeLibrary.redCircle,
      shapeLibrary.blueSquare,
      shapeLibrary.redCircle,
      shapeLibrary.blueSquare,
    ],
    options: [shapeLibrary.redCircle, shapeLibrary.blueSquare],
    glitchReplacement: shapeLibrary.yellowStar,
  },
  {
    id: "abc",
    label: "ABC Pattern",
    missingCount: 3,
    sequence: [
      shapeLibrary.redTriangle,
      shapeLibrary.greenSquare,
      shapeLibrary.yellowCircle,
      shapeLibrary.redTriangle,
      shapeLibrary.greenSquare,
      shapeLibrary.yellowCircle,
    ],
    options: [
      shapeLibrary.redTriangle,
      shapeLibrary.greenSquare,
      shapeLibrary.yellowCircle,
    ],
    glitchReplacement: shapeLibrary.blueCircle,
  },
  {
    id: "aabbc",
    label: "AABBC Pattern",
    missingCount: 5,
    sequence: [
      shapeLibrary.redSquare,
      shapeLibrary.redSquare,
      shapeLibrary.blueTriangle,
      shapeLibrary.blueTriangle,
      shapeLibrary.yellowStar,
      shapeLibrary.redSquare,
      shapeLibrary.redSquare,
      shapeLibrary.blueTriangle,
      shapeLibrary.blueTriangle,
      shapeLibrary.yellowStar,
    ],
    options: [
      shapeLibrary.redSquare,
      shapeLibrary.blueTriangle,
      shapeLibrary.yellowStar,
    ],
    glitchReplacement: shapeLibrary.greenSquare,
  },
];

export const freePlayObjects = [
  {
    id: "red-block",
    label: "Red block",
    type: "block",
    imagePath: "/assets/objects/pretend/block.webp",
    lineOrder: 1,
  },
  {
    id: "blue-circle",
    label: "Blue circle",
    type: "circle",
    imagePath: "/assets/objects/patterns/circle-blue.svg",
    lineOrder: 2,
  },
  {
    id: "toy-car",
    label: "Toy car",
    type: "vehicle",
    imagePath: "/assets/objects/topics/cars.webp",
    lineOrder: 3,
  },
  {
    id: "cat",
    label: "Cat",
    type: "animal",
    imagePath: "/assets/characters/guides/cat.webp",
    lineOrder: 4,
  },
  {
    id: "green-block",
    label: "Green block",
    type: "block",
    imagePath: "/assets/objects/patterns/square-green.svg",
    lineOrder: 5,
  },
  {
    id: "yellow-circle",
    label: "Yellow circle",
    type: "circle",
    imagePath: "/assets/objects/patterns/circle-yellow.svg",
    lineOrder: 6,
  },
  {
    id: "train",
    label: "Train",
    type: "vehicle",
    imagePath: "/assets/objects/topics/trains.webp",
    lineOrder: 7,
  },
  {
    id: "dog",
    label: "Dog",
    type: "animal",
    imagePath: "/assets/characters/guides/dog.webp",
    lineOrder: 8,
  },
  {
    id: "red-circle",
    label: "Red circle",
    type: "circle",
    imagePath: "/assets/objects/patterns/circle-red.svg",
    lineOrder: 9,
  },
  {
    id: "bear",
    label: "Bear",
    type: "animal",
    imagePath: "/assets/characters/guides/bear.webp",
    lineOrder: 10,
  },
];

function makeFacts(topic, terms) {
  return Array.from({ length: 20 }, (_, index) => {
    const term = terms[index % terms.length];
    return `${topic} fact ${index + 1}: ${term}.`;
  });
}

export const topicBooks = [
  {
    id: "trains",
    topic: "Trains",
    coverImagePath: "/assets/objects/topics/trains.webp",
    facts: makeFacts("Trains", [
      "some trains carry people between cities",
      "freight trains carry heavy goods",
      "tracks help trains move in a steady path",
      "train whistles warn people nearby",
    ]),
  },
  {
    id: "space",
    topic: "Space",
    coverImagePath: "/assets/objects/topics/space.webp",
    facts: makeFacts("Space", [
      "rockets push upward with powerful engines",
      "planets move around stars",
      "astronauts train before going to orbit",
      "the Moon reflects sunlight",
    ]),
  },
  {
    id: "animals",
    topic: "Animals",
    coverImagePath: "/assets/objects/topics/animals.webp",
    facts: makeFacts("Animals", [
      "some animals live in groups",
      "birds use feathers to stay warm",
      "dogs use smell to learn about places",
      "many animals communicate with sounds",
    ]),
  },
  {
    id: "numbers",
    topic: "Numbers",
    coverImagePath: "/assets/objects/topics/numbers.webp",
    facts: makeFacts("Numbers", [
      "counting helps compare groups",
      "patterns can repeat with numbers",
      "zero means none",
      "even numbers can be split into pairs",
    ]),
  },
  {
    id: "colors",
    topic: "Colors",
    coverImagePath: "/assets/objects/topics/colors.webp",
    facts: makeFacts("Colors", [
      "red, yellow, and blue can mix into other colors",
      "rainbows have many colors",
      "artists choose colors to show feelings",
      "light changes how colors look",
    ]),
  },
  {
    id: "dinosaurs",
    topic: "Dinosaurs",
    coverImagePath: "/assets/objects/topics/dinosaurs.webp",
    facts: makeFacts("Dinosaurs", [
      "dinosaurs lived long before people",
      "fossils help scientists learn about dinosaurs",
      "some dinosaurs ate plants",
      "some dinosaurs walked on two legs",
    ]),
  },
  {
    id: "cars",
    topic: "Cars",
    coverImagePath: "/assets/objects/topics/cars.webp",
    facts: makeFacts("Cars", [
      "cars use wheels to move on roads",
      "seat belts help keep passengers safe",
      "engines or motors make cars go",
      "traffic lights help drivers take turns",
    ]),
  },
  {
    id: "music",
    topic: "Music",
    coverImagePath: "/assets/objects/topics/music.webp",
    facts: makeFacts("Music", [
      "songs can be fast or slow",
      "drums help keep a beat",
      "melodies can go high and low",
      "people use music to celebrate",
    ]),
  },
];

const chapter7 = {
  patternSequences,
  freePlayObjects,
  topicBooks,
};

export default chapter7;
