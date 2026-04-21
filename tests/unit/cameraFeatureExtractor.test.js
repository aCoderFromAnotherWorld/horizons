import { describe, expect, test } from "bun:test";

import { computeCameraFeatures } from "@/lib/ml/cameraFeatureExtractor.js";

describe("camera feature extraction", () => {
  test("returns zero-safe defaults without camera frames", () => {
    expect(computeCameraFeatures([])).toEqual({
      cameraFrameCount: 0,
      expressionFrameCount: 0,
      expressionFlatness: 0,
      expressionMirrorAccuracy: 0,
      gazeToFaceRatio: 0,
      eyeContactDurationMs: 0,
      avgBlinkRate: 0,
      headPoseVariability: 0,
    });
  });

  test("computes facial expression mirror accuracy and flatness", () => {
    const features = computeCameraFeatures([
      {
        taskKey: "happy-1",
        capturedAt: 1000,
        expressionScores: { happy: 0.8, sad: 0.1, neutral: 0.1 },
      },
      {
        taskKey: "sad-1",
        capturedAt: 1100,
        expressionScores: { happy: 0.7, sad: 0.2, neutral: 0.1 },
      },
    ]);

    expect(features.cameraFrameCount).toBe(2);
    expect(features.expressionFrameCount).toBe(2);
    expect(features.expressionMirrorAccuracy).toBe(0.5);
    expect(features.expressionFlatness).toBeGreaterThan(0);
    expect(features.expressionFlatness).toBeLessThanOrEqual(1);
  });

  test("computes gaze, blink, and head-pose features", () => {
    const features = computeCameraFeatures([
      {
        taskKey: "gaze-1",
        capturedAt: 1000,
        gazeDirection: { x: 0.1, y: 0.1 },
        blinkRate: 0.2,
        headPose: { pitch: 1, yaw: 2, roll: 3 },
      },
      {
        taskKey: "gaze-2",
        capturedAt: 1200,
        gazeDirection: { x: 0.7, y: 0.1 },
        blinkRate: 0.4,
        headPose: { pitch: 2, yaw: 4, roll: 6 },
      },
    ]);

    expect(features.gazeToFaceRatio).toBe(0.5);
    expect(features.eyeContactDurationMs).toBe(200);
    expect(features.avgBlinkRate).toBeCloseTo(0.3);
    expect(features.headPoseVariability).toBeGreaterThan(0);
  });
});
