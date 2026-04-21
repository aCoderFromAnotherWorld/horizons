import { describe, expect, test } from "bun:test";

import { freePlayObjects, patternSequences } from "@/lib/gameData/chapter7";
import {
  analyzeFreePlayInteractions,
  countTopicSelections,
  detectLiningUpPattern,
  detectSameObjectRepeated,
  getExpectedPatternItem,
  getMaxConsecutiveObjectRepeats,
  hasHighFactCount,
  hasTopicRepeatedThreePlus,
  scorePatternChange,
  scoreSpecialInterest,
  shouldFlagRigidPatternDistress,
} from "@/lib/scoring/chapter7";

function interactions(ids) {
  return ids.map((objectId, index) => ({ objectId, recordedAt: index }));
}

describe("Chapter 7 pattern completion scoring", () => {
  test("gets the first missing AB pattern item", () => {
    const expected = getExpectedPatternItem(patternSequences[0], 0);

    expect(expected.id).toBe("red-circle");
  });

  test("gets later missing complex pattern item", () => {
    const expected = getExpectedPatternItem(patternSequences[2], 4);

    expect(expected.id).toBe("yellow-star");
  });

  test("distress at forced error scores three points", () => {
    expect(scorePatternChange({ distressAtChange: true })).toBe(3);
  });

  test("refusing new pattern scores three points", () => {
    expect(scorePatternChange({ refusedNewPattern: true })).toBe(3);
  });

  test("slow start to new pattern scores two points", () => {
    expect(scorePatternChange({ newPatternDelayMs: 10001 })).toBe(2);
  });

  test("returning to first pattern scores two points", () => {
    expect(scorePatternChange({ returnedToFirstPattern: true })).toBe(2);
  });

  test("rigid pattern red flag requires distress and return", () => {
    expect(
      shouldFlagRigidPatternDistress({
        distressAtChange: true,
        returnedToFirstPattern: true,
      }),
    ).toBe(true);
  });

  test("rigid pattern red flag does not trigger with distress alone", () => {
    expect(
      shouldFlagRigidPatternDistress({
        distressAtChange: true,
        returnedToFirstPattern: false,
      }),
    ).toBe(false);
  });
});

describe("Chapter 7 free-play analysis", () => {
  test("counts max consecutive same-object repeats", () => {
    expect(
      getMaxConsecutiveObjectRepeats(
        interactions(["car", "car", "block", "block", "block"]),
      ),
    ).toBe(3);
  });

  test("detects same-object repeated eight times", () => {
    expect(detectSameObjectRepeated(interactions(Array(8).fill("train")))).toBe(
      true,
    );
  });

  test("does not count nonconsecutive repeats as same action repetition", () => {
    expect(
      detectSameObjectRepeated(
        interactions(["train", "car", "train", "car", "train", "car", "train", "car"]),
      ),
    ).toBe(false);
  });

  test("detects full left-to-right lining-up sequence", () => {
    const orderedIds = [...freePlayObjects]
      .sort((a, b) => a.lineOrder - b.lineOrder)
      .map((object) => object.id);

    expect(detectLiningUpPattern(interactions(orderedIds), freePlayObjects)).toBe(
      true,
    );
  });

  test("does not detect lining up when sequence is reversed", () => {
    const reversedIds = [...freePlayObjects]
      .sort((a, b) => b.lineOrder - a.lineOrder)
      .map((object) => object.id);

    expect(detectLiningUpPattern(interactions(reversedIds), freePlayObjects)).toBe(
      false,
    );
  });

  test("free-play analysis adds repetition, lining, and distress points", () => {
    const orderedIds = [...freePlayObjects]
      .sort((a, b) => a.lineOrder - b.lineOrder)
      .map((object) => object.id);
    const repeatedIds = Array(8).fill("red-block");

    const analysis = analyzeFreePlayInteractions({
      interactions: interactions([...repeatedIds, ...orderedIds]),
      objects: freePlayObjects,
      distressAtDisruption: true,
    });

    expect(analysis.points).toBe(6);
    expect(analysis.sameObjectRepeated).toBe(true);
    expect(analysis.liningUpDetected).toBe(true);
  });
});

describe("Chapter 7 special-interest scoring", () => {
  test("counts topic selections", () => {
    expect(countTopicSelections(["trains", "space", "trains"])).toEqual({
      trains: 2,
      space: 1,
    });
  });

  test("detects a topic selected three or more times", () => {
    expect(hasTopicRepeatedThreePlus(["trains", "space", "trains", "trains"])).toBe(
      true,
    );
  });

  test("does not detect topic repetition below three selections", () => {
    expect(hasTopicRepeatedThreePlus(["trains", "space", "trains"])).toBe(false);
  });

  test("detects fifteen or more facts on one topic", () => {
    expect(hasHighFactCount({ trains: 15, space: 4 })).toBe(true);
  });

  test("special-interest score includes repeated topic and high fact count", () => {
    const scoring = scoreSpecialInterest({
      selections: ["trains", "space", "trains", "trains"],
      factCountsByTopic: { trains: 15 },
    });

    expect(scoring.points).toBe(5);
  });

  test("special-interest score counts slow transitions and returns", () => {
    const scoring = scoreSpecialInterest({
      transitionDelaysMs: [8000, 8001, 12000],
      returnToSameCount: 2,
    });

    expect(scoring.transitionResistanceCount).toBe(2);
    expect(scoring.points).toBe(8);
  });
});
