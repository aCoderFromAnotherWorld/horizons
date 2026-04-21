export const guideAnimals = [
  {
    id: "bunny",
    name: "Bunny",
    image: "/assets/characters/guides/bunny.webp",
    pointImage: "/assets/characters/guides/bunny-point.webp",
    waveImage: "/assets/characters/guides/bunny-wave.webp",
  },
  {
    id: "owl",
    name: "Owl",
    image: "/assets/characters/guides/owl.webp",
  },
  {
    id: "cat",
    name: "Cat",
    image: "/assets/characters/guides/cat.webp",
  },
  {
    id: "dog",
    name: "Dog",
    image: "/assets/characters/guides/dog.webp",
  },
  {
    id: "bear",
    name: "Bear",
    image: "/assets/characters/guides/bear.webp",
  },
];

export const guideTargetObjects = [
  {
    id: "lamp",
    label: "Lamp",
    image: "/assets/objects/lamp.webp",
    position: "left-[12%] top-[20%]",
  },
  {
    id: "book",
    label: "Book",
    image: "/assets/objects/book.webp",
    position: "right-[18%] top-[18%]",
  },
  {
    id: "cup",
    label: "Cup",
    image: "/assets/objects/cup.webp",
    position: "left-[24%] bottom-[18%]",
  },
  {
    id: "ball",
    label: "Ball",
    image: "/assets/objects/ball.webp",
    position: "right-[12%] bottom-[22%]",
  },
  {
    id: "plant",
    label: "Plant",
    image: "/assets/objects/plant.webp",
    position: "left-[48%] top-[44%]",
  },
];

export const nameCallConfig = {
  totalCalls: 3,
  intervalMs: 5000,
  taskKeys: ["ch1_name_1", "ch1_name_2", "ch1_name_3"],
};

export const avatarOptions = {
  hair: [
    "/assets/characters/avatar/hair-1.webp",
    "/assets/characters/avatar/hair-2.webp",
    "/assets/characters/avatar/hair-3.webp",
    "/assets/characters/avatar/hair-4.webp",
  ],
  clothes: [
    "/assets/characters/avatar/clothes-1.webp",
    "/assets/characters/avatar/clothes-2.webp",
    "/assets/characters/avatar/clothes-3.webp",
    "/assets/characters/avatar/clothes-4.webp",
  ],
  hairColors: ["#3f2a1d", "#111827", "#92400e", "#facc15", "#ef4444", "#7c3aed"],
  clothesColors: [
    "#22c55e",
    "#3b82f6",
    "#f97316",
    "#ec4899",
    "#8b5cf6",
    "#14b8a6",
  ],
};

const chapter1 = {
  guideAnimals,
  guideTargetObjects,
  nameCallConfig,
  avatarOptions,
};

export default chapter1;
