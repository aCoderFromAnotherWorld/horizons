import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";

import { saveCameraFrame } from "@/lib/db/queries/cameraFrames.js";
import { batchInsertMouseMovements } from "@/lib/db/queries/mouseMovements.js";
import { addRedFlag } from "@/lib/db/queries/redFlags.js";
import { createResponse } from "@/lib/db/queries/responses.js";
import { addChapterScore } from "@/lib/db/queries/scores.js";
import { createSession } from "@/lib/db/queries/sessions.js";
import { resetDbForTests, setDbForTests } from "@/lib/db/index.js";
import { SCHEMA } from "@/lib/db/schema.js";
import {
  CAMERA_FEATURE_NAMES,
  FEATURE_NAMES,
  extractFeatureVector,
} from "@/lib/ml/featureExtractor.js";

let db;

beforeEach(() => {
  db = new Database(":memory:");
  db.exec(SCHEMA);
  db.exec("PRAGMA foreign_keys = ON;");
  setDbForTests(db);
});

afterEach(() => {
  resetDbForTests();
  db.close();
});

describe("ML feature extraction", () => {
  test("returns a stable 44-feature vector with camera features appended", () => {
    createSession({
      id: "ml-session",
      playerAge: 6,
      startedAt: 1000,
      cameraEnabled: true,
    });
    addChapterScore({
      sessionId: "ml-session",
      chapterKey: "ch2_emotion",
      rawPoints: 8,
    });
    addChapterScore({
      sessionId: "ml-session",
      chapterKey: "ch8_imitation",
      rawPoints: 4,
    });
    createResponse({
      sessionId: "ml-session",
      chapter: 2,
      level: 2,
      taskKey: "happy-1",
      startedAt: 1100,
      responseTimeMs: 600,
      selection: { emotion: "happy" },
      isCorrect: true,
      extraData: { targetEmotion: "happy" },
    });
    createResponse({
      sessionId: "ml-session",
      chapter: 8,
      level: 1,
      taskKey: "ch8_simple_wave",
      startedAt: 1200,
      responseTimeMs: null,
      selection: "timeout",
      isCorrect: false,
      scorePoints: 2,
    });
    batchInsertMouseMovements([
      { sessionId: "ml-session", taskKey: "happy-1", x: 10, y: 10, recordedAt: 1 },
      { sessionId: "ml-session", taskKey: "happy-1", x: 20, y: 20, recordedAt: 11 },
    ]);
    addRedFlag({
      sessionId: "ml-session",
      flagType: "poor_imitation_all_modalities",
    });
    saveCameraFrame({
      sessionId: "ml-session",
      taskKey: "happy-1",
      capturedAt: 1300,
      expressionScores: { happy: 0.9, neutral: 0.1 },
      gazeDirection: { x: 0.1, y: 0.1 },
      blinkRate: 0.2,
      headPose: { pitch: 1, yaw: 2, roll: 3 },
    });

    const { featureNames, featureVector } = extractFeatureVector("ml-session");

    expect(featureNames).toEqual(FEATURE_NAMES);
    expect(featureVector).toHaveLength(44);
    expect(CAMERA_FEATURE_NAMES).toHaveLength(8);
    expect(
      featureVector[featureNames.indexOf("social_communication_raw_score")],
    ).toBe(12);
    expect(featureVector[featureNames.indexOf("player_age")]).toBe(6);
    expect(featureVector[featureNames.indexOf("camera_frame_count")]).toBe(1);
    expect(featureVector[featureNames.indexOf("expression_mirror_accuracy")]).toBe(1);
    expect(featureVector[featureNames.indexOf("flag_imitation_deficit")]).toBe(1);
  });
});

