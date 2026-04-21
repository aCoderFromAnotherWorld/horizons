import { describe, expect, test } from "bun:test";

import {
  getNextNameCallDelayMs,
  scoreGuideFollowing,
  scoreNameResponse,
} from "@/lib/scoring/chapter1.js";

describe("Chapter 1 name response scoring", () => {
  test("scores responses under 2 seconds as 0 points", () => {
    expect(scoreNameResponse(1999)).toBe(0);
  });

  test("scores exactly 2 seconds as 1 point", () => {
    expect(scoreNameResponse(2000)).toBe(1);
  });

  test("scores responses between 2 and 5 seconds as 1 point", () => {
    expect(scoreNameResponse(3500)).toBe(1);
  });

  test("scores exactly 5 seconds as 1 point", () => {
    expect(scoreNameResponse(5000)).toBe(1);
  });

  test("scores responses over 5 seconds as 2 points", () => {
    expect(scoreNameResponse(5001)).toBe(2);
  });

  test("scores no response as 2 points", () => {
    expect(scoreNameResponse(null)).toBe(2);
  });

  test("adds attempt penalty after the first attempt", () => {
    expect(scoreNameResponse(1500, 3)).toBe(2);
    expect(scoreNameResponse(null, 2)).toBe(3);
  });

  test("uses the configured interval before the next name call", () => {
    expect(getNextNameCallDelayMs(true, 5000)).toBe(5000);
    expect(getNextNameCallDelayMs(false, 5000)).toBe(0);
  });
});

describe("Chapter 1 guide following scoring", () => {
  test("scores target click without prompt as 0 points", () => {
    expect(
      scoreGuideFollowing({
        clickedTarget: true,
        clickedPointer: false,
        promptUsed: false,
      }),
    ).toBe(0);
  });

  test("scores target click after prompt as 1 point", () => {
    expect(
      scoreGuideFollowing({
        clickedTarget: true,
        clickedPointer: false,
        promptUsed: true,
      }),
    ).toBe(1);
  });

  test("scores pointer click as 2 points", () => {
    expect(
      scoreGuideFollowing({
        clickedTarget: false,
        clickedPointer: true,
        promptUsed: false,
      }),
    ).toBe(2);
  });

  test("scores random clicking as 3 points", () => {
    expect(
      scoreGuideFollowing({
        clickedTarget: false,
        clickedPointer: false,
        promptUsed: false,
      }),
    ).toBe(3);
  });
});
