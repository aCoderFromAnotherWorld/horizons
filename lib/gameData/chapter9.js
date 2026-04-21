import { getScoresBySession } from "@/lib/db/queries/scores.js";
import { guideTargetObjects } from "@/lib/gameData/chapter1.js";
import { faceCards, scenarioCards } from "@/lib/gameData/chapter2.js";
import { conversationExchanges } from "@/lib/gameData/chapter3.js";
import { morningRoutineCards } from "@/lib/gameData/chapter4.js";
import { pretendPlayAnimations } from "@/lib/gameData/chapter5.js";
import { sensorySounds, textureCards } from "@/lib/gameData/chapter6.js";
import { freePlayObjects, patternSequences } from "@/lib/gameData/chapter7.js";
import { simpleActions } from "@/lib/gameData/chapter8.js";

function optionSet(items, selectedItem, mapOption, size = 4) {
  const selectedId = selectedItem.id;
  const leading = items.filter((item) => item.id !== selectedId).slice(0, size - 1);
  return [selectedItem, ...leading].slice(0, size).map(mapOption);
}

const CHAPTER_TASKS = {
  ch1_baseline: guideTargetObjects.map((object) => ({
    chapterKey: "ch1_baseline",
    sourceChapter: 1,
    id: `review_ch1_${object.id}`,
    prompt: `Tap the ${object.label}.`,
    imagePath: object.image,
    options: optionSet(guideTargetObjects, object, (item) => ({
      id: item.id,
      label: item.label,
      imagePath: item.image,
    })),
    correctOptionId: object.id,
  })),
  ch2_emotion: [
    ...faceCards.slice(0, 8).map((card) => ({
      chapterKey: "ch2_emotion",
      sourceChapter: 2,
      id: `review_ch2_face_${card.id}`,
      prompt: `Find the ${card.emotion} face.`,
      imagePath: card.imagePath,
      options: faceCards
        .filter((option) => option.subjectType === card.subjectType)
        .slice(0, 4)
        .map((option) => ({
          id: option.emotion,
          label: option.emotion,
          imagePath: option.imagePath,
        })),
      correctOptionId: card.emotion,
    })),
    ...scenarioCards.slice(0, 4).map((card) => ({
      chapterKey: "ch2_emotion",
      sourceChapter: 2,
      id: `review_ch2_scenario_${card.id}`,
      prompt: card.description,
      imagePath: card.imagePath,
      options: ["happy", "sad", "angry", "scared"].map((emotion) => ({
        id: emotion,
        label: emotion,
        imagePath: `/assets/ui/flower-${emotion}.webp`,
      })),
      correctOptionId: card.correctEmotion,
    })),
  ],
  ch3_social: conversationExchanges.slice(0, 8).map((exchange) => ({
    chapterKey: "ch3_social",
    sourceChapter: 3,
    id: `review_ch3_${exchange.id}`,
    prompt: exchange.friendSays,
    imagePath: "/assets/characters/guides/bunny-wave.webp",
    options: exchange.options.slice(0, 4).map((option) => ({
      id: option.type,
      label: option.text,
      imagePath: "/assets/characters/guides/bunny.webp",
    })),
    correctOptionId: "social",
  })),
  ch4_executive: morningRoutineCards.map((card) => ({
    chapterKey: "ch4_executive",
    sourceChapter: 4,
    id: `review_ch4_${card.id}`,
    prompt: `Which card belongs in the morning routine? ${card.label}`,
    imagePath: card.imagePath,
    options: optionSet(morningRoutineCards, card, (option) => ({
      id: option.id,
      label: option.label,
      imagePath: option.imagePath,
    })),
    correctOptionId: card.id,
  })),
  ch5_pretend: pretendPlayAnimations.map((item) => ({
    chapterKey: "ch5_pretend",
    sourceChapter: 5,
    id: `review_ch5_${item.id}`,
    prompt: item.description,
    imagePath: item.imagePath,
    options: [
      {
        id: "pretend",
        label: "They're pretending!",
        imagePath: "/assets/backgrounds/theater-stage.webp",
      },
      {
        id: "literal",
        label: item.literalInterpretation,
        imagePath: item.imagePath,
      },
    ],
    correctOptionId: "pretend",
  })),
  ch6_sensory: [
    ...sensorySounds.slice(0, 4).map((sound) => ({
      chapterKey: "ch6_sensory",
      sourceChapter: 6,
      id: `review_ch6_sound_${sound.id}`,
      prompt: `What made this sound? ${sound.name}`,
      imagePath: sound.animatedSourceImage,
      options: optionSet(sensorySounds, sound, (option) => ({
        id: option.id,
        label: option.name,
        imagePath: option.animatedSourceImage,
      })),
      correctOptionId: sound.id,
    })),
    ...textureCards.slice(0, 4).map((texture) => ({
      chapterKey: "ch6_sensory",
      sourceChapter: 6,
      id: `review_ch6_texture_${texture.id}`,
      prompt: `Find ${texture.name}.`,
      imagePath: texture.imagePath,
      options: optionSet(textureCards, texture, (option) => ({
        id: option.id,
        label: option.name,
        imagePath: option.imagePath,
      })),
      correctOptionId: texture.id,
    })),
  ],
  ch7_pattern: [
    ...patternSequences.map((pattern) => ({
      chapterKey: "ch7_pattern",
      sourceChapter: 7,
      id: `review_ch7_pattern_${pattern.id}`,
      prompt: `Which piece continues the ${pattern.label}?`,
      imagePath: pattern.sequence[0].imagePath,
      options: pattern.options.map((option) => ({
        id: option.id,
        label: option.label,
        imagePath: option.imagePath,
      })),
      correctOptionId: pattern.sequence.at(-1).id,
    })),
    ...freePlayObjects.slice(0, 5).map((object) => ({
      chapterKey: "ch7_pattern",
      sourceChapter: 7,
      id: `review_ch7_object_${object.id}`,
      prompt: `Find ${object.label}.`,
      imagePath: object.imagePath,
      options: optionSet(freePlayObjects, object, (option) => ({
        id: option.id,
        label: option.label,
        imagePath: option.imagePath,
      })),
      correctOptionId: object.id,
    })),
  ],
  ch8_imitation: simpleActions.slice(0, 8).map((action) => ({
    chapterKey: "ch8_imitation",
    sourceChapter: 8,
    id: `review_ch8_${action.id}`,
    prompt: "What did they do?",
    imagePath: action.animationPath,
    options: action.options.map((imagePath, index) => ({
      id: `${action.id}_${index}`,
      label: index === action.correctOptionIndex ? action.id : `Choice ${index + 1}`,
      imagePath,
    })),
    correctOptionId: `${action.id}_${action.correctOptionIndex}`,
  })),
};

function chapterScoreWeights(sessionId) {
  const totals = {};
  for (const score of getScoresBySession(sessionId)) {
    totals[score.chapterKey] = (totals[score.chapterKey] || 0) + score.rawPoints;
  }
  return totals;
}

function stableOffset(sessionId, length) {
  if (!length) return 0;
  return [...sessionId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % length;
}

/**
 * Samples 20 Chapter 9 review tasks, weighted toward higher-scoring chapters.
 */
export function sampleTasksForChapter9(sessionId) {
  const totals = chapterScoreWeights(sessionId);
  const weightedPool = [];

  for (const [chapterKey, tasks] of Object.entries(CHAPTER_TASKS)) {
    const repeatCount = Math.max(1, Math.ceil((totals[chapterKey] || 0) / 5));
    for (let repeat = 0; repeat < repeatCount; repeat += 1) {
      weightedPool.push(...tasks);
    }
  }

  const offset = stableOffset(sessionId, weightedPool.length);
  return Array.from({ length: 20 }, (_, index) => {
    const task = weightedPool[(offset + index) % weightedPool.length];
    return {
      ...task,
      reviewIndex: index + 1,
      taskKey: `ch9_review_${index + 1}_${task.id}`,
    };
  });
}

const chapter9 = {
  sampleTasksForChapter9,
};

export default chapter9;
