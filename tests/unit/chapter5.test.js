import { describe, expect, test } from "bun:test";

import {
  countLiteralSelections,
  countSymbolicSelections,
  hasRigidRepetitiveUse,
  scorePretendCreation,
  scorePretendRecognition,
  shouldFlagCompleteAbsencePretendPlay,
  symbolicSelectionRatio,
} from "@/lib/scoring/chapter5.js";

const literalCup = { name: "Cup", isLiteral: true };
const literalPot = { name: "Pot", isLiteral: true };
const symbolicBanana = { name: "Banana", isLiteral: false };
const symbolicBox = { name: "Box", isLiteral: false };

describe("Chapter 5 pretend recognition scoring", () => {
  test("pretend response scores zero", () => {
    expect(scorePretendRecognition("pretend")).toBe(0);
  });

  test("literal response scores two", () => {
    expect(scorePretendRecognition("literal")).toBe(2);
  });

  test("timeout scores one", () => {
    expect(scorePretendRecognition("pretend", true)).toBe(1);
  });

  test("complete absence flag triggers when all trials are literal", () => {
    expect(shouldFlagCompleteAbsencePretendPlay(5, 5)).toBe(true);
  });

  test("complete absence flag does not trigger with one pretend response", () => {
    expect(shouldFlagCompleteAbsencePretendPlay(4, 5)).toBe(false);
  });

  test("complete absence flag does not trigger without trials", () => {
    expect(shouldFlagCompleteAbsencePretendPlay(0, 0)).toBe(false);
  });
});

describe("Chapter 5 pretend creation scoring", () => {
  test("counts symbolic selections", () => {
    expect(
      countSymbolicSelections([literalCup, symbolicBanana, symbolicBox]),
    ).toBe(2);
  });

  test("counts literal selections", () => {
    expect(countLiteralSelections([literalCup, literalPot, symbolicBox])).toBe(2);
  });

  test("symbolic ratio is zero without selections", () => {
    expect(symbolicSelectionRatio([])).toBe(0);
  });

  test("symbolic ratio divides symbolic by total selections", () => {
    expect(symbolicSelectionRatio([literalCup, symbolicBanana])).toBe(0.5);
  });

  test("literal-only selections score four", () => {
    expect(scorePretendCreation([literalCup, literalPot], 8000)).toBe(4);
  });

  test("symbolic selection scores zero before slow threshold", () => {
    expect(scorePretendCreation([literalCup, symbolicBanana], 8000)).toBe(0);
  });

  test("timeout without engagement scores refusal plus slow point", () => {
    expect(scorePretendCreation([], 15001, true)).toBe(4);
  });

  test("manual empty submission scores as refusal before slow threshold", () => {
    expect(scorePretendCreation([], 8000, false)).toBe(3);
  });

  test("slow response adds one point", () => {
    expect(scorePretendCreation([symbolicBanana], 15001)).toBe(1);
  });

  test("detects rigid repetitive use of the same object", () => {
    expect(
      hasRigidRepetitiveUse([symbolicBanana, symbolicBanana, symbolicBanana]),
    ).toBe(true);
  });

  test("does not detect rigid use with varied objects", () => {
    expect(
      hasRigidRepetitiveUse([symbolicBanana, literalCup, symbolicBox]),
    ).toBe(false);
  });

  test("rigid symbolic use scores two", () => {
    expect(
      scorePretendCreation([symbolicBanana, symbolicBanana, symbolicBanana], 8000),
    ).toBe(2);
  });

  test("rigid symbolic slow use scores three", () => {
    expect(
      scorePretendCreation([symbolicBanana, symbolicBanana, symbolicBanana], 15001),
    ).toBe(3);
  });
});
