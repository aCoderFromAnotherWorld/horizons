import { describe, expect, test } from "bun:test";

import { imitationSequences, simpleActions } from "@/lib/gameData/chapter8";
import {
  detectPerseveration,
  scoreSequenceAttempt,
  scoreSimpleImitation,
  shouldFlagPoorImitation,
  summarizeSequentialImitation,
  summarizeSimpleImitation,
} from "@/lib/scoring/chapter8";

describe("Chapter 8 simple imitation scoring", () => {
  test("correct simple imitation scores zero", () => {
    expect(
      scoreSimpleImitation({ category: "facial", isCorrect: true }),
    ).toBe(0);
  });

  test("facial imitation error scores two", () => {
    expect(
      scoreSimpleImitation({ category: "facial", isCorrect: false }),
    ).toBe(2);
  });

  test("body imitation error scores one", () => {
    expect(scoreSimpleImitation({ category: "body", isCorrect: false })).toBe(1);
  });

  test("object imitation error scores one", () => {
    expect(scoreSimpleImitation({ category: "object", isCorrect: false })).toBe(1);
  });

  test("timeout scores two regardless of category", () => {
    expect(
      scoreSimpleImitation({
        category: "object",
        isCorrect: false,
        timedOut: true,
      }),
    ).toBe(2);
  });

  test("summarizes total and category errors", () => {
    const summary = summarizeSimpleImitation([
      { category: "facial", isCorrect: false, scorePoints: 2 },
      { category: "body", isCorrect: false, scorePoints: 1 },
      { category: "object", isCorrect: true, scorePoints: 0 },
    ]);

    expect(summary).toEqual({
      totalErrors: 2,
      facialErrors: 1,
      bodyErrors: 1,
      objectErrors: 0,
      points: 3,
    });
  });

  test("poor imitation flag triggers at six total errors", () => {
    expect(shouldFlagPoorImitation(6)).toBe(true);
  });

  test("poor imitation flag does not trigger below six errors", () => {
    expect(shouldFlagPoorImitation(5)).toBe(false);
  });

  test("game data contains twelve simple actions", () => {
    expect(simpleActions).toHaveLength(12);
  });
});

describe("Chapter 8 sequential imitation scoring", () => {
  test("correct two-action sequence scores zero", () => {
    const sequence = imitationSequences[0];

    expect(scoreSequenceAttempt(sequence, sequence.steps)).toEqual({
      totalErrors: 0,
      isComplete: true,
      points: 0,
    });
  });

  test("two-action sequence error scores one per error", () => {
    const sequence = imitationSequences[0];

    expect(scoreSequenceAttempt(sequence, ["jump", "clap"]).points).toBe(1);
  });

  test("three-action sequence error scores two per error", () => {
    const sequence = imitationSequences.find((item) => item.type === "3-action");

    expect(scoreSequenceAttempt(sequence, ["sit", sequence.steps[1], "clap"]).points).toBe(2);
  });

  test("missing sequence steps count as errors", () => {
    const sequence = imitationSequences[0];

    expect(scoreSequenceAttempt(sequence, [sequence.steps[0]]).totalErrors).toBe(1);
  });

  test("extra sequence steps count as errors", () => {
    const sequence = imitationSequences[0];

    expect(
      scoreSequenceAttempt(sequence, [...sequence.steps, "jump"]).totalErrors,
    ).toBe(1);
  });

  test("perseveration triggers when same wrong step repeats three times", () => {
    expect(detectPerseveration(["jump", "jump", "jump"])).toBe(true);
  });

  test("perseveration does not trigger below three repeats", () => {
    expect(detectPerseveration(["jump", "jump", "sit"])).toBe(false);
  });

  test("sequential summary adds cannot-complete-any-3-action penalty", () => {
    const summary = summarizeSequentialImitation([
      { type: "3-action", isComplete: false, perseveration: false, points: 2 },
      { type: "3-action", isComplete: false, perseveration: false, points: 4 },
    ]);

    expect(summary.cannotCompleteAnyThreeAction).toBe(true);
    expect(summary.points).toBe(9);
  });

  test("sequential summary skips 3-action penalty when one is complete", () => {
    const summary = summarizeSequentialImitation([
      { type: "3-action", isComplete: false, perseveration: false, points: 2 },
      { type: "3-action", isComplete: true, perseveration: false, points: 0 },
    ]);

    expect(summary.cannotCompleteAnyThreeAction).toBe(false);
    expect(summary.points).toBe(2);
  });

  test("sequential summary adds perseveration penalty per sequence", () => {
    const summary = summarizeSequentialImitation([
      { type: "2-action", isComplete: false, perseveration: true, points: 1 },
      { type: "3-action", isComplete: true, perseveration: false, points: 0 },
    ]);

    expect(summary.perseverationCount).toBe(1);
    expect(summary.points).toBe(3);
  });
});
