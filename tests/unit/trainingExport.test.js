import { describe, expect, test } from "bun:test";

import { FEATURE_NAMES } from "@/lib/ml/featureExtractor.js";
import {
  buildTrainingRows,
  getTrainingDataQuality,
  parseLabelMap,
  trainingRowsToCsv,
} from "@/lib/ml/trainingExport.js";

describe("training export helpers", () => {
  test("parseLabelMap parses JSON labels as numbers", () => {
    expect(parseLabelMap('{"s1":1,"s2":0}')).toEqual({ s1: 1, s2: 0 });
  });

  test("buildTrainingRows includes only labeled sessions", () => {
    const rows = buildTrainingRows({
      sessions: [
        { id: "s1", playerAge: 6, completedAt: 1000, cameraEnabled: true },
        { id: "s2", playerAge: 7, status: "active", cameraEnabled: false },
      ],
      labelBySessionId: { s1: 1 },
      extractFeatureVectorImpl: () => ({
        featureVector: Array.from({ length: FEATURE_NAMES.length }, () => 0),
      }),
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      sessionId: "s1",
      playerAge: 6,
      completed: true,
      cameraEnabled: true,
      label: 1,
    });
  });

  test("trainingRowsToCsv exports feature columns and label", () => {
    const csv = trainingRowsToCsv([
      {
        sessionId: "s1",
        featureVector: Array.from(
          { length: FEATURE_NAMES.length },
          (_, index) => index,
        ),
        label: 1,
      },
    ]);

    expect(csv).toContain("session_id");
    expect(csv).toContain("camera_frame_count");
    expect(csv).toContain("label");
    expect(csv.split("\n")).toHaveLength(2);
  });

  test("getTrainingDataQuality reports balance and missing camera rate", () => {
    const cameraIndex = FEATURE_NAMES.indexOf("camera_frame_count");
    const withCamera = Array.from({ length: FEATURE_NAMES.length }, () => 0);
    withCamera[cameraIndex] = 5;
    const noCamera = Array.from({ length: FEATURE_NAMES.length }, () => 0);

    const quality = getTrainingDataQuality([
      {
        playerAge: 6,
        completed: true,
        featureVector: withCamera,
        label: 1,
      },
      {
        playerAge: 7,
        completed: false,
        featureVector: noCamera,
        label: 0,
      },
    ]);

    expect(quality.classBalance).toEqual({ 0: 1, 1: 1 });
    expect(quality.completionRate).toBe(0.5);
    expect(quality.missingCameraDataRate).toBe(0.5);
  });
});

