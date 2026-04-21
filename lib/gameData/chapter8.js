const actionPath = (id) => `/assets/objects/actions/${id}.webp`;

const actionOptions = {
  facial: [
    actionPath("smile"),
    actionPath("frown"),
    actionPath("wink"),
    actionPath("surprised"),
  ],
  body: [
    actionPath("wave"),
    actionPath("clap"),
    actionPath("jump"),
    actionPath("arms-up"),
  ],
  object: [
    actionPath("pour-water"),
    actionPath("stack-blocks"),
    actionPath("thumbs-up"),
    actionPath("sit"),
  ],
};

export const simpleActions = [
  {
    id: "smile",
    category: "facial",
    animationPath: actionPath("smile"),
    correctOptionIndex: 0,
    options: actionOptions.facial,
  },
  {
    id: "frown",
    category: "facial",
    animationPath: actionPath("frown"),
    correctOptionIndex: 1,
    options: actionOptions.facial,
  },
  {
    id: "wink",
    category: "facial",
    animationPath: actionPath("wink"),
    correctOptionIndex: 2,
    options: actionOptions.facial,
  },
  {
    id: "surprised",
    category: "facial",
    animationPath: actionPath("surprised"),
    correctOptionIndex: 3,
    options: actionOptions.facial,
  },
  {
    id: "wave",
    category: "body",
    animationPath: actionPath("wave"),
    correctOptionIndex: 0,
    options: actionOptions.body,
  },
  {
    id: "clap",
    category: "body",
    animationPath: actionPath("clap"),
    correctOptionIndex: 1,
    options: actionOptions.body,
  },
  {
    id: "jump",
    category: "body",
    animationPath: actionPath("jump"),
    correctOptionIndex: 2,
    options: actionOptions.body,
  },
  {
    id: "arms-up",
    category: "body",
    animationPath: actionPath("arms-up"),
    correctOptionIndex: 3,
    options: actionOptions.body,
  },
  {
    id: "pour-water",
    category: "object",
    animationPath: actionPath("pour-water"),
    correctOptionIndex: 0,
    options: actionOptions.object,
  },
  {
    id: "stack-blocks",
    category: "object",
    animationPath: actionPath("stack-blocks"),
    correctOptionIndex: 1,
    options: actionOptions.object,
  },
  {
    id: "thumbs-up",
    category: "object",
    animationPath: actionPath("thumbs-up"),
    correctOptionIndex: 2,
    options: actionOptions.object,
  },
  {
    id: "sit",
    category: "object",
    animationPath: actionPath("sit"),
    correctOptionIndex: 3,
    options: actionOptions.object,
  },
];

export const imitationSequences = [
  {
    id: "wave-clap",
    type: "2-action",
    steps: ["wave", "clap"],
    distractorOptions: ["jump", "sit"],
  },
  {
    id: "smile-thumbs",
    type: "2-action",
    steps: ["smile", "thumbs-up"],
    distractorOptions: ["frown", "arms-up"],
  },
  {
    id: "pour-stack",
    type: "2-action",
    steps: ["pour-water", "stack-blocks"],
    distractorOptions: ["wink", "clap"],
  },
  {
    id: "wave-jump-clap",
    type: "3-action",
    steps: ["wave", "jump", "clap"],
    distractorOptions: ["sit", "wink"],
  },
  {
    id: "smile-arms-sit",
    type: "3-action",
    steps: ["smile", "arms-up", "sit"],
    distractorOptions: ["frown", "stack-blocks"],
  },
  {
    id: "pour-thumb-stack",
    type: "3-action",
    steps: ["pour-water", "thumbs-up", "stack-blocks"],
    distractorOptions: ["surprised", "jump"],
  },
];

export const actionById = Object.fromEntries(
  simpleActions.map((action) => [action.id, action]),
);

const chapter8 = {
  simpleActions,
  imitationSequences,
  actionById,
};

export default chapter8;
