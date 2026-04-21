export const pretendPlayAnimations = [
  {
    id: "banana-phone",
    description: "A child holds a banana to their ear and talks to Grandma.",
    literalInterpretation: "They are eating a banana.",
    pretendInterpretation: "They're pretending the banana is a phone.",
    imagePath: "/assets/objects/pretend/banana.webp",
    animationClass: "rotate-[-8deg]",
  },
  {
    id: "empty-pot",
    description: "A child stirs an empty pot and says the soup is ready.",
    literalInterpretation: "They are stirring nothing.",
    pretendInterpretation: "They're pretending to cook soup.",
    imagePath: "/assets/objects/pretend/pot.webp",
    animationClass: "translate-y-1",
  },
  {
    id: "feed-teddy",
    description: "A child gives a teddy bear a spoonful of pretend porridge.",
    literalInterpretation: "They are touching a teddy bear.",
    pretendInterpretation: "They're pretending to feed the teddy.",
    imagePath: "/assets/objects/pretend/teddy.webp",
    animationClass: "scale-105",
  },
  {
    id: "block-car",
    description: "A child pushes a block across the floor and makes engine sounds.",
    literalInterpretation: "They are moving a block.",
    pretendInterpretation: "They're pretending the block is a car.",
    imagePath: "/assets/objects/pretend/block.webp",
    animationClass: "translate-x-2",
  },
  {
    id: "empty-cup",
    description: "A child sips from an empty cup and says it is warm cocoa.",
    literalInterpretation: "They are drinking from an empty cup.",
    pretendInterpretation: "They're pretending to drink cocoa.",
    imagePath: "/assets/objects/pretend/empty-cup.webp",
    animationClass: "-translate-y-1",
  },
];

const pretendObjectPalette = [
  { name: "Banana", isLiteral: false, imagePath: "/assets/objects/pretend/banana.webp" },
  { name: "Box", isLiteral: false, imagePath: "/assets/objects/pretend/box.webp" },
  { name: "Stick", isLiteral: false, imagePath: "/assets/objects/pretend/stick.webp" },
  { name: "Pillow", isLiteral: false, imagePath: "/assets/objects/pretend/pillow.webp" },
  { name: "Teddy", isLiteral: true, imagePath: "/assets/objects/pretend/teddy.webp" },
  { name: "Pot", isLiteral: true, imagePath: "/assets/objects/pretend/pot.webp" },
  { name: "Cup", isLiteral: true, imagePath: "/assets/objects/pretend/empty-cup.webp" },
  { name: "Block", isLiteral: true, imagePath: "/assets/objects/pretend/block.webp" },
];

export const pretendPlayPrompts = [
  {
    id: "tea-party",
    scenario: "Make a tea party.",
    objects: pretendObjectPalette,
  },
  {
    id: "superheroes",
    scenario: "Make a superhero adventure.",
    objects: pretendObjectPalette,
  },
  {
    id: "trip",
    scenario: "Make a going-on-a-trip story.",
    objects: pretendObjectPalette,
  },
  {
    id: "build-house",
    scenario: "Make a building-a-house story.",
    objects: pretendObjectPalette,
  },
];

const chapter5 = {
  pretendPlayAnimations,
  pretendPlayPrompts,
};

export default chapter5;
