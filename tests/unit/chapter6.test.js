import { describe, expect, test } from "bun:test";

import { textureCards, visualRooms } from "@/lib/gameData/chapter6.js";
import {
  isAversiveTextureRating,
  isDistressingSoundRating,
  scoreSoundRating,
  scoreSoundSummary,
  scoreTextureRating,
  scoreTextureSummary,
  scoreVisualRooms,
  shouldFlagExtremeSoundSensitivity,
} from "@/lib/scoring/chapter6.js";

describe("Chapter 6 sound sensitivity scoring", () => {
  test("happy and neutral are not distressing", () => {
    expect(isDistressingSoundRating("happy")).toBe(false);
    expect(isDistressingSoundRating("neutral")).toBe(false);
  });

  test("worried, upset, cover ears, and leave are distressing", () => {
    expect(isDistressingSoundRating("worried")).toBe(true);
    expect(isDistressingSoundRating("upset")).toBe(true);
    expect(isDistressingSoundRating("cover_ears")).toBe(true);
    expect(isDistressingSoundRating("leave")).toBe(true);
  });

  test("sound ratings follow the base scoring table", () => {
    expect(scoreSoundRating("happy", "nature")).toBe(0);
    expect(scoreSoundRating("neutral", "nature")).toBe(0);
    expect(scoreSoundRating("worried", "nature")).toBe(1);
    expect(scoreSoundRating("upset", "nature")).toBe(2);
    expect(scoreSoundRating("cover_ears", "nature")).toBe(3);
    expect(scoreSoundRating("leave", "nature")).toBe(4);
  });

  test("mechanical distress adds the specific clinical flag points", () => {
    expect(scoreSoundRating("worried", "mechanical")).toBe(3);
    expect(scoreSoundRating("happy", "mechanical")).toBe(0);
  });

  test("sound summary adds threshold penalties", () => {
    expect(
      scoreSoundSummary({
        distressCount: 4,
        coverEarsCount: 3,
        leaveCount: 2,
      }),
    ).toBe(8);
  });

  test("extreme sound sensitivity red flag triggers at four distressing sounds", () => {
    expect(shouldFlagExtremeSoundSensitivity(3)).toBe(false);
    expect(shouldFlagExtremeSoundSensitivity(4)).toBe(true);
  });
});

describe("Chapter 6 visual room scoring", () => {
  test("avoiding three or more rooms adds two points", () => {
    const result = scoreVisualRooms(
      visualRooms.slice(0, 3).map((room) => ({
        roomId: room.id,
        type: room.type,
        durationMs: 4000,
        leftEarly: false,
      })),
      visualRooms,
    );
    expect(result.avoidedCount).toBe(3);
    expect(result.points).toBe(2);
  });

  test("quick flickering or spinning exits add two points each", () => {
    const result = scoreVisualRooms(
      [
        {
          roomId: "flickering",
          type: "flickering",
          durationMs: 2500,
          leftEarly: true,
        },
        {
          roomId: "spinning-pinwheel",
          type: "spinning",
          durationMs: 2500,
          leftEarly: true,
        },
      ],
      visualRooms.slice(0, 2),
    );
    expect(result.quickMotionExits).toBe(2);
    expect(result.points).toBe(4);
  });

  test("long repetitive pattern room adds one point", () => {
    const result = scoreVisualRooms(
      [
        {
          roomId: "stripes",
          type: "stripes",
          durationMs: 61000,
          leftEarly: false,
        },
      ],
      [{ id: "stripes" }],
    );
    expect(result.longPatternRooms).toBe(1);
    expect(result.points).toBe(1);
  });

  test("crowded scene early exit adds one point", () => {
    const result = scoreVisualRooms(
      [
        {
          roomId: "crowded",
          type: "crowded",
          durationMs: 2000,
          leftEarly: true,
        },
      ],
      [{ id: "crowded" }],
    );
    expect(result.crowdedDistress).toBe(true);
    expect(result.points).toBe(1);
  });
});

describe("Chapter 6 texture preference scoring", () => {
  test("texture rating base points match the scoring table", () => {
    expect(scoreTextureRating("love")).toBe(0);
    expect(scoreTextureRating("okay")).toBe(0);
    expect(scoreTextureRating("dont_like")).toBe(1);
    expect(scoreTextureRating("never_touch")).toBe(2);
    expect(scoreTextureRating("wont_try")).toBe(3);
  });

  test("aversive texture ratings are detected", () => {
    expect(isAversiveTextureRating("love")).toBe(false);
    expect(isAversiveTextureRating("dont_like")).toBe(true);
    expect(isAversiveTextureRating("never_touch")).toBe(true);
    expect(isAversiveTextureRating("wont_try")).toBe(true);
  });

  test("four or more aversive textures adds two summary points", () => {
    const result = scoreTextureSummary(
      [
        { textureId: "cotton", rating: "dont_like" },
        { textureId: "glass", rating: "dont_like" },
        { textureId: "rock", rating: "dont_like" },
        { textureId: "sandpaper", rating: "dont_like" },
      ],
      textureCards,
    );
    expect(result.aversiveCount).toBe(4);
    expect(result.points).toBe(2);
  });

  test("all wet textures aversive adds two summary points", () => {
    const result = scoreTextureSummary(
      [
        { textureId: "clay", rating: "dont_like" },
        { textureId: "honey", rating: "never_touch" },
        { textureId: "jello", rating: "wont_try" },
      ],
      textureCards,
    );
    expect(result.allWetAversive).toBe(true);
    expect(result.points).toBe(4);
  });

  test("two or more refusal ratings adds two summary points", () => {
    const result = scoreTextureSummary(
      [
        { textureId: "cotton", rating: "never_touch" },
        { textureId: "glass", rating: "wont_try" },
      ],
      textureCards,
    );
    expect(result.refusesCount).toBe(2);
    expect(result.points).toBe(2);
  });
});
