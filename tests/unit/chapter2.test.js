import { describe, expect, test } from "bun:test";

import {
  calcEmotionMatchingPoints,
  isFearSadConfusion,
  isNegativeEmotion,
  scoreExpressionSelection,
  scoreRegulationSelection,
  shouldTriggerNegativeEmotionFlag,
} from "@/lib/scoring/chapter2.js";
import { calcGameAccuracy } from "@/lib/scoring/engine.js";

describe("Chapter 2 negative emotion detection", () => {
  test("sad is a negative emotion", () => {
    expect(isNegativeEmotion("sad")).toBe(true);
  });

  test("scared is a negative emotion", () => {
    expect(isNegativeEmotion("scared")).toBe(true);
  });

  test("happy is not a negative emotion", () => {
    expect(isNegativeEmotion("happy")).toBe(false);
  });

  test("angry is not counted in the sad/fear negative accuracy rule", () => {
    expect(isNegativeEmotion("angry")).toBe(false);
  });
});

describe("Chapter 2 fear/sad confusion", () => {
  test("scared dropped on sad is confusion", () => {
    expect(isFearSadConfusion("scared", "sad")).toBe(true);
  });

  test("sad dropped on scared is confusion", () => {
    expect(isFearSadConfusion("sad", "scared")).toBe(true);
  });

  test("sad dropped on angry is not fear/sad confusion", () => {
    expect(isFearSadConfusion("sad", "angry")).toBe(false);
  });

  test("scared dropped on happy is not fear/sad confusion", () => {
    expect(isFearSadConfusion("scared", "happy")).toBe(false);
  });
});

describe("Chapter 2 red flag threshold", () => {
  test("does not trigger without negative emotion attempts", () => {
    expect(shouldTriggerNegativeEmotionFlag(0, 0)).toBe(false);
  });

  test("triggers below 50 percent negative emotion accuracy", () => {
    expect(shouldTriggerNegativeEmotionFlag(1, 3)).toBe(true);
  });

  test("does not trigger at exactly 50 percent", () => {
    expect(shouldTriggerNegativeEmotionFlag(2, 4)).toBe(false);
  });

  test("does not trigger above 50 percent", () => {
    expect(shouldTriggerNegativeEmotionFlag(3, 4)).toBe(false);
  });
});

describe("Chapter 2 EmoGalaxy accuracy and matching points", () => {
  test("EmoGalaxy accuracy returns correct over total moves", () => {
    expect(calcGameAccuracy(10, 15)).toBe(10 / 15);
  });

  test("EmoGalaxy accuracy returns 0 for no moves", () => {
    expect(calcGameAccuracy(0, 0)).toBe(0);
  });

  test("matching points are 0 above 90 percent", () => {
    expect(
      calcEmotionMatchingPoints({
        accuracy: 0.95,
        negativeAccuracy: 1,
        fearSadConfusions: 0,
        totalMoves: 20,
      }),
    ).toBe(0);
  });

  test("matching points are 1 between 70 and 90 percent", () => {
    expect(
      calcEmotionMatchingPoints({
        accuracy: 0.75,
        negativeAccuracy: 1,
        fearSadConfusions: 0,
        totalMoves: 20,
      }),
    ).toBe(1);
  });

  test("matching points are 2 between 50 and 70 percent", () => {
    expect(
      calcEmotionMatchingPoints({
        accuracy: 0.6,
        negativeAccuracy: 1,
        fearSadConfusions: 0,
        totalMoves: 20,
      }),
    ).toBe(2);
  });

  test("matching points are 3 below 50 percent", () => {
    expect(
      calcEmotionMatchingPoints({
        accuracy: 0.4,
        negativeAccuracy: 1,
        fearSadConfusions: 0,
        totalMoves: 20,
      }),
    ).toBe(3);
  });

  test("matching points add penalty for negative emotion accuracy below 80 percent", () => {
    expect(
      calcEmotionMatchingPoints({
        accuracy: 0.95,
        negativeAccuracy: 0.75,
        fearSadConfusions: 0,
        totalMoves: 20,
      }),
    ).toBe(2);
  });

  test("matching points add penalty for fear/sad confusion above 25 percent", () => {
    expect(
      calcEmotionMatchingPoints({
        accuracy: 0.95,
        negativeAccuracy: 1,
        fearSadConfusions: 6,
        totalMoves: 20,
      }),
    ).toBe(2);
  });
});

describe("Chapter 2 expression scoring", () => {
  test("correct emotion and intensity scores 0", () => {
    expect(
      scoreExpressionSelection({
        targetEmotion: "happy",
        targetIntensity: 2,
        selected: { emotion: "happy", intensity: 2 },
      }),
    ).toEqual({ points: 0, type: "correct" });
  });

  test("same emotion wrong intensity scores 1", () => {
    expect(
      scoreExpressionSelection({
        targetEmotion: "happy",
        targetIntensity: 2,
        selected: { emotion: "happy", intensity: 3 },
      }),
    ).toEqual({ points: 1, type: "intensity_error" });
  });

  test("neutral selected scores 2", () => {
    expect(
      scoreExpressionSelection({
        targetEmotion: "sad",
        targetIntensity: 2,
        selected: { emotion: "neutral", intensity: 2 },
      }),
    ).toEqual({ points: 2, type: "neutral" });
  });

  test("opposite emotion scores 3", () => {
    expect(
      scoreExpressionSelection({
        targetEmotion: "angry",
        targetIntensity: 2,
        selected: { emotion: "happy", intensity: 2 },
      }),
    ).toEqual({ points: 3, type: "opposite" });
  });
});

describe("Chapter 2 regulation scoring", () => {
  test("appropriate response scores 0 before slow threshold", () => {
    expect(scoreRegulationSelection("appropriate", 14000)).toBe(0);
  });

  test("avoidant response scores 2", () => {
    expect(scoreRegulationSelection("avoidant", 14000)).toBe(2);
  });

  test("aggressive response scores 3", () => {
    expect(scoreRegulationSelection("aggressive", 14000)).toBe(3);
  });

  test("slow decision adds one point", () => {
    expect(scoreRegulationSelection("appropriate", 15001)).toBe(1);
    expect(scoreRegulationSelection("aggressive", 15001)).toBe(4);
  });

  test("unknown response type defaults to aggressive-level score", () => {
    expect(scoreRegulationSelection("unknown", 1000)).toBe(3);
  });
});
