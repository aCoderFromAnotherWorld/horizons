import { describe, expect, test } from "bun:test";

import {
  countActivityRepeats,
  countSequenceErrors,
  hasExactSameSequence,
  hasSameActivityThreePlus,
  scoreDisruptionResponse,
  scorePlaygroundChoices,
  scoreRoutineAttempt,
  scoreUnexpectedResponse,
  shuffleRoutineCards,
} from "@/lib/scoring/chapter4.js";

const correctOrder = [
  "wake-up",
  "brush-teeth",
  "get-dressed",
  "eat-breakfast",
  "pack-bag",
  "put-shoes",
];

describe("Chapter 4 sequence error counting", () => {
  test("correct order has zero errors", () => {
    expect(countSequenceErrors(correctOrder, correctOrder)).toBe(0);
  });

  test("one swapped pair counts two position errors", () => {
    expect(
      countSequenceErrors(
        ["wake-up", "get-dressed", "brush-teeth", "eat-breakfast", "pack-bag", "put-shoes"],
        correctOrder,
      ),
    ).toBe(2);
  });

  test("reversed order counts all positions wrong", () => {
    expect(countSequenceErrors([...correctOrder].reverse(), correctOrder)).toBe(6);
  });

  test("missing item position counts as an error", () => {
    expect(
      countSequenceErrors(
        ["wake-up", "brush-teeth", "get-dressed", "eat-breakfast", "pack-bag", "missing"],
        correctOrder,
      ),
    ).toBe(1);
  });

  test("routine attempt score uses sequence errors before final attempt", () => {
    expect(scoreRoutineAttempt(2, 2)).toBe(2);
  });

  test("routine attempt score adds incomplete penalty on third failed attempt", () => {
    expect(scoreRoutineAttempt(2, 3)).toBe(5);
  });

  test("routine attempt score stays zero when third attempt is correct", () => {
    expect(scoreRoutineAttempt(0, 3)).toBe(0);
  });

  test("routine shuffle preserves all cards", () => {
    const cards = correctOrder.map((id) => ({ id }));
    const shuffled = shuffleRoutineCards(cards, () => 0.42);
    expect(shuffled.map((card) => card.id).sort()).toEqual([...correctOrder].sort());
  });

  test("routine shuffle avoids returning the original order", () => {
    const cards = correctOrder.map((id) => ({ id }));
    const shuffled = shuffleRoutineCards(cards, () => 0.999);
    expect(shuffled.map((card) => card.id)).not.toEqual(correctOrder);
  });
});

describe("Chapter 4 disruption scoring", () => {
  test("flexible response scores zero before slow threshold", () => {
    expect(scoreDisruptionResponse("flexible", 9000)).toBe(0);
  });

  test("rigid response scores three", () => {
    expect(scoreDisruptionResponse("rigid", 9000)).toBe(3);
  });

  test("distress response scores two", () => {
    expect(scoreDisruptionResponse("distress", 9000)).toBe(2);
  });

  test("slow disruption response adds one point", () => {
    expect(scoreDisruptionResponse("flexible", 10001)).toBe(1);
    expect(scoreDisruptionResponse("rigid", 10001)).toBe(4);
  });
});

describe("Chapter 4 playground repetition detection", () => {
  test("counts activity repeats", () => {
    expect(countActivityRepeats(["slide", "swings", "slide"])).toEqual({
      slide: 2,
      swings: 1,
    });
  });

  test("detects same activity three or more times", () => {
    expect(hasSameActivityThreePlus(["slide", "slide", "swings", "slide"])).toBe(
      true,
    );
  });

  test("does not detect repetition below three", () => {
    expect(hasSameActivityThreePlus(["slide", "swings", "slide", "sandbox"])).toBe(
      false,
    );
  });

  test("detects exact same sequence every loop", () => {
    expect(hasExactSameSequence(["slide", "slide", "slide", "slide"])).toBe(true);
  });

  test("does not detect exact same sequence when sequence varies", () => {
    expect(hasExactSameSequence(["slide", "slide", "swings", "slide"])).toBe(false);
  });

  test("does not detect exact same sequence with fewer than four selections", () => {
    expect(hasExactSameSequence(["slide", "slide", "slide"])).toBe(false);
  });

  test("playground score includes repetition and slow transitions", () => {
    expect(scorePlaygroundChoices(["slide", "slide", "slide", "slide"], [0, 9000, 0, 9001])).toBe(9);
  });

  test("playground score is zero for varied timely choices", () => {
    expect(
      scorePlaygroundChoices(["slide", "swings", "sandbox", "see-saw"], [0, 2000, 3000, 4000]),
    ).toBe(0);
  });
});

describe("Chapter 4 unexpected event scoring", () => {
  test("flexible response scores zero before slow threshold", () => {
    expect(scoreUnexpectedResponse("flexible", 11000)).toBe(0);
  });

  test("distress response scores two", () => {
    expect(scoreUnexpectedResponse("distress", 11000)).toBe(2);
  });

  test("rigid response scores three", () => {
    expect(scoreUnexpectedResponse("rigid", 11000)).toBe(3);
  });

  test("slow unexpected response adds one point", () => {
    expect(scoreUnexpectedResponse("flexible", 12001)).toBe(1);
    expect(scoreUnexpectedResponse("rigid", 12001)).toBe(4);
  });
});
