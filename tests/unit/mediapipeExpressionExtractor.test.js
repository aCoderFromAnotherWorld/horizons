import { describe, expect, test } from "bun:test";

import { __testing } from "@/lib/camera/mediapipeExpressionExtractor.js";

describe("MediaPipe expression extractor helpers", () => {
  test("maps blendshape categories by name", () => {
    expect(
      __testing.mapBlendshapes([
        { categoryName: "mouthSmileLeft", score: 0.8 },
        { categoryName: "mouthSmileRight", score: 0.6 },
      ]),
    ).toEqual({
      mouthSmileLeft: 0.8,
      mouthSmileRight: 0.6,
    });
  });

  test("estimates happy expression from smile blendshapes", () => {
    const scores = __testing.estimateExpressionScores({
      mouthSmileLeft: 0.9,
      mouthSmileRight: 0.8,
      eyeWideLeft: 0.05,
      eyeWideRight: 0.05,
    });

    expect(scores.happy).toBeGreaterThan(scores.sad);
    expect(scores.happy).toBeGreaterThan(scores.angry);
    expect(scores.neutral).toBeGreaterThanOrEqual(0);
  });

  test("estimates gaze direction from iris and face centers", () => {
    const landmarks = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }));
    for (const index of [468, 469, 470, 471, 472, 473, 474, 475, 476, 477]) {
      landmarks[index] = { x: 0.6, y: 0.4 };
    }

    expect(__testing.estimateGazeDirection(landmarks)).toEqual({
      x: expect.any(Number),
      y: expect.any(Number),
    });
  });
});

