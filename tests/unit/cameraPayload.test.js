import { describe, expect, test } from "bun:test";

import {
  buildCameraFramePayload,
  hasCameraDerivedData,
} from "@/lib/camera/framePayload.js";

describe("camera frame payload helpers", () => {
  test("detects whether extracted metadata has derived camera fields", () => {
    expect(hasCameraDerivedData({})).toBe(false);
    expect(hasCameraDerivedData({ expressionScores: { happy: 0.7 } })).toBe(true);
    expect(hasCameraDerivedData({ rawImage: "not-allowed" })).toBe(false);
  });

  test("buildCameraFramePayload copies only approved derived fields", () => {
    const payload = buildCameraFramePayload({
      sessionId: "session-1",
      taskKey: "ch2_expression_1",
      chapterId: 2,
      levelId: 2,
      capturedAt: 1000,
      extracted: {
        faceLandmarks: [{ x: 0.1, y: 0.2 }],
        expressionScores: { happy: 0.7 },
        rawImage: "not-allowed",
        framePixels: [1, 2, 3],
      },
    });

    expect(payload).toEqual({
      sessionId: "session-1",
      taskKey: "ch2_expression_1",
      chapter: 2,
      level: 2,
      capturedAt: 1000,
      faceLandmarks: [{ x: 0.1, y: 0.2 }],
      expressionScores: { happy: 0.7 },
    });
  });
});

