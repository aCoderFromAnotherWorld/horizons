import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";

import { resetDbForTests, setDbForTests } from "@/lib/db/index.js";
import { SCHEMA } from "@/lib/db/schema.js";
import {
  createSession,
  deleteSession,
  getSession,
  listSessions,
  updateSession,
} from "@/lib/db/queries/sessions.js";
import {
  createResponse,
  getResponsesBySession,
  getResponsesByTask,
} from "@/lib/db/queries/responses.js";
import {
  addChapterScore,
  getScoresBySession,
  getTotalScoreByChapter,
} from "@/lib/db/queries/scores.js";
import {
  batchInsertMouseMovements,
  getMovementsBySession,
} from "@/lib/db/queries/mouseMovements.js";
import {
  getCameraFramesBySession,
  getCameraFramesByTask,
  saveCameraFrame,
} from "@/lib/db/queries/cameraFrames.js";
import {
  addRedFlag,
  getRedFlagsBySession,
} from "@/lib/db/queries/redFlags.js";
import {
  getDomainScoresBySession,
  upsertDomainScore,
} from "@/lib/db/queries/domainScores.js";
import {
  getMlPredictionBySession,
  upsertMlPrediction,
} from "@/lib/db/queries/mlPredictions.js";

let db;

function seedSession(overrides = {}) {
  return createSession({
    id: "session-1",
    playerAge: 6,
    playerName: "Ari",
    startedAt: 1000,
    ...overrides,
  });
}

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

describe("session queries", () => {
  test("createSession inserts defaults and JSON avatar data", () => {
    const session = seedSession({ avatarData: { hair: 2, clothes: 1 } });

    expect(session).toEqual({
      id: "session-1",
      playerAge: 6,
      playerName: "Ari",
      startedAt: 1000,
      completedAt: null,
      currentChapter: 1,
      currentLevel: 1,
      status: "active",
      avatarData: { hair: 2, clothes: 1 },
      cameraEnabled: false,
      cameraConsentAt: null,
      cameraConsentVersion: null,
    });
  });

  test("getSession returns null for a missing session", () => {
    expect(getSession("missing")).toBeNull();
  });

  test("getSession returns a stored session", () => {
    seedSession();

    expect(getSession("session-1").playerName).toBe("Ari");
  });

  test("updateSession updates selected fields", () => {
    seedSession();
    const updated = updateSession("session-1", {
      completedAt: 2000,
      currentChapter: 3,
        currentLevel: 2,
        status: "completed",
        avatarData: { hairColor: 4 },
        cameraEnabled: true,
        cameraConsentAt: 3000,
        cameraConsentVersion: "camera-consent-v1",
      });

    expect(updated.completedAt).toBe(2000);
    expect(updated.currentChapter).toBe(3);
    expect(updated.currentLevel).toBe(2);
    expect(updated.status).toBe("completed");
    expect(updated.avatarData).toEqual({ hairColor: 4 });
    expect(updated.cameraEnabled).toBe(true);
    expect(updated.cameraConsentAt).toBe(3000);
    expect(updated.cameraConsentVersion).toBe("camera-consent-v1");
  });

  test("updateSession with no fields returns the existing session", () => {
    seedSession();

    expect(updateSession("session-1", {})).toEqual(getSession("session-1"));
  });

  test("listSessions orders newest first", () => {
    seedSession({ id: "old", startedAt: 1000 });
    seedSession({ id: "new", startedAt: 3000 });

    expect(listSessions().map((session) => session.id)).toEqual(["new", "old"]);
  });

  test("deleteSession removes a session", () => {
    seedSession();

    expect(deleteSession("session-1")).toBe(1);
    expect(getSession("session-1")).toBeNull();
  });
});

describe("response queries", () => {
  test("createResponse inserts and returns JSON fields", () => {
    seedSession();
    const response = createResponse({
      sessionId: "session-1",
      chapter: 2,
      level: 1,
      taskKey: "ch2_emotion_1",
      startedAt: 1100,
      responseTimeMs: 450,
      selection: { emotion: "happy" },
      isCorrect: true,
      attemptNumber: 2,
      scorePoints: 1,
      extraData: { phase: "face" },
    });

    expect(response.id).toBe(1);
    expect(response.selection).toEqual({ emotion: "happy" });
    expect(response.isCorrect).toBe(true);
    expect(response.extraData).toEqual({ phase: "face" });
  });

  test("getResponsesBySession returns all responses in insert order", () => {
    seedSession();
    createResponse({
      sessionId: "session-1",
      chapter: 1,
      level: 1,
      taskKey: "a",
      startedAt: 100,
    });
    createResponse({
      sessionId: "session-1",
      chapter: 1,
      level: 1,
      taskKey: "b",
      startedAt: 200,
    });

    expect(getResponsesBySession("session-1").map((row) => row.taskKey)).toEqual([
      "a",
      "b",
    ]);
  });

  test("getResponsesByTask filters by session and task key", () => {
    seedSession();
    createResponse({
      sessionId: "session-1",
      chapter: 1,
      level: 1,
      taskKey: "same",
      startedAt: 100,
    });
    createResponse({
      sessionId: "session-1",
      chapter: 1,
      level: 1,
      taskKey: "other",
      startedAt: 200,
    });

    expect(getResponsesByTask("session-1", "same")).toHaveLength(1);
  });

  test("task_responses enforces session foreign key", () => {
    expect(() =>
      createResponse({
        sessionId: "missing",
        chapter: 1,
        level: 1,
        taskKey: "bad",
        startedAt: 100,
      }),
    ).toThrow();
  });

  test("deleting a session cascades to responses", () => {
    seedSession();
    createResponse({
      sessionId: "session-1",
      chapter: 1,
      level: 1,
      taskKey: "cascade",
      startedAt: 100,
    });

    deleteSession("session-1");

    expect(getResponsesBySession("session-1")).toEqual([]);
  });
});

describe("score queries", () => {
  test("addChapterScore inserts a score", () => {
    seedSession();
    const score = addChapterScore({
      sessionId: "session-1",
      chapterKey: "ch2_emotion",
      rawPoints: 3,
      recordedAt: 1200,
    });

    expect(score).toMatchObject({
      sessionId: "session-1",
      chapterKey: "ch2_emotion",
      rawPoints: 3,
      recordedAt: 1200,
    });
  });

  test("getScoresBySession returns inserted scores", () => {
    seedSession();
    addChapterScore({ sessionId: "session-1", chapterKey: "a", rawPoints: 1 });
    addChapterScore({ sessionId: "session-1", chapterKey: "b", rawPoints: 2 });

    expect(getScoresBySession("session-1")).toHaveLength(2);
  });

  test("getTotalScoreByChapter sums matching chapter scores", () => {
    seedSession();
    addChapterScore({
      sessionId: "session-1",
      chapterKey: "ch2_emotion",
      rawPoints: 2,
    });
    addChapterScore({
      sessionId: "session-1",
      chapterKey: "ch2_emotion",
      rawPoints: 4,
    });
    addChapterScore({
      sessionId: "session-1",
      chapterKey: "ch3_social",
      rawPoints: 10,
    });

    expect(getTotalScoreByChapter("session-1", "ch2_emotion")).toBe(6);
  });

  test("chapter_scores enforces session foreign key", () => {
    expect(() =>
      addChapterScore({
        sessionId: "missing",
        chapterKey: "bad",
        rawPoints: 1,
      }),
    ).toThrow();
  });
});

describe("mouse movement queries", () => {
  test("batchInsertMouseMovements returns zero for an empty batch", () => {
    expect(batchInsertMouseMovements([])).toBe(0);
  });

  test("batchInsertMouseMovements inserts all movements", () => {
    seedSession();

    expect(
      batchInsertMouseMovements([
        { sessionId: "session-1", taskKey: "task", x: 1, y: 2, recordedAt: 10 },
        { sessionId: "session-1", taskKey: "task", x: 3, y: 4, recordedAt: 20 },
      ]),
    ).toBe(2);
    expect(getMovementsBySession("session-1")).toHaveLength(2);
  });

  test("getMovementsBySession maps movement fields", () => {
    seedSession();
    batchInsertMouseMovements([
      { sessionId: "session-1", taskKey: "task", x: 1.5, y: 2.5, recordedAt: 10 },
    ]);

    expect(getMovementsBySession("session-1")[0]).toMatchObject({
      sessionId: "session-1",
      taskKey: "task",
      x: 1.5,
      y: 2.5,
      recordedAt: 10,
    });
  });

  test("mouse_movements enforces session foreign key", () => {
    expect(() =>
      batchInsertMouseMovements([
        { sessionId: "missing", taskKey: "bad", x: 1, y: 1, recordedAt: 10 },
      ]),
    ).toThrow();
  });
});

describe("camera frame queries", () => {
  test("saveCameraFrame stores derived facial expression data", () => {
    seedSession();
    const frame = saveCameraFrame({
      sessionId: "session-1",
      taskKey: "ch2_expression_1",
      chapter: 2,
      level: 2,
      capturedAt: 1234,
      faceLandmarks: [{ x: 0.1, y: 0.2, z: 0.3 }],
      expressionScores: { happy: 0.85, neutral: 0.1 },
      gazeDirection: { x: 0.2, y: -0.1 },
      blinkRate: 0.25,
      headPose: { pitch: 1, yaw: 2, roll: 3 },
      extraData: { model: "test-expression-model" },
    });

    expect(frame).toMatchObject({
      sessionId: "session-1",
      taskKey: "ch2_expression_1",
      chapter: 2,
      level: 2,
      capturedAt: 1234,
      expressionScores: { happy: 0.85, neutral: 0.1 },
      gazeDirection: { x: 0.2, y: -0.1 },
      blinkRate: 0.25,
      headPose: { pitch: 1, yaw: 2, roll: 3 },
      extraData: { model: "test-expression-model" },
    });
    expect(frame.faceLandmarks).toEqual([{ x: 0.1, y: 0.2, z: 0.3 }]);
  });

  test("getCameraFramesBySession returns frames in insert order", () => {
    seedSession();
    saveCameraFrame({
      sessionId: "session-1",
      taskKey: "first",
      capturedAt: 100,
    });
    saveCameraFrame({
      sessionId: "session-1",
      taskKey: "second",
      capturedAt: 200,
    });

    expect(getCameraFramesBySession("session-1").map((frame) => frame.taskKey)).toEqual([
      "first",
      "second",
    ]);
  });

  test("getCameraFramesByTask filters by session and task key", () => {
    seedSession();
    saveCameraFrame({ sessionId: "session-1", taskKey: "same", capturedAt: 100 });
    saveCameraFrame({ sessionId: "session-1", taskKey: "same", capturedAt: 200 });
    saveCameraFrame({ sessionId: "session-1", taskKey: "other", capturedAt: 300 });

    expect(getCameraFramesByTask("session-1", "same")).toHaveLength(2);
  });

  test("camera_frames enforces session foreign key", () => {
    expect(() =>
      saveCameraFrame({
        sessionId: "missing",
        taskKey: "bad",
        capturedAt: 100,
      }),
    ).toThrow();
  });

  test("deleting a session cascades to camera frames", () => {
    seedSession();
    saveCameraFrame({
      sessionId: "session-1",
      taskKey: "cascade",
      capturedAt: 100,
    });

    deleteSession("session-1");

    expect(getCameraFramesBySession("session-1")).toEqual([]);
  });
});

describe("red flag queries", () => {
  test("addRedFlag inserts a flag with default severity", () => {
    seedSession();
    const flag = addRedFlag({
      sessionId: "session-1",
      flagType: "negative_emotion_recognition_under_50",
      description: "Low negative emotion recognition",
      recordedAt: 5000,
    });

    expect(flag.severity).toBe("moderate");
    expect(flag.recordedAt).toBe(5000);
  });

  test("getRedFlagsBySession returns inserted flags", () => {
    seedSession();
    addRedFlag({ sessionId: "session-1", flagType: "a" });
    addRedFlag({ sessionId: "session-1", flagType: "b", severity: "severe" });

    expect(getRedFlagsBySession("session-1").map((flag) => flag.flagType)).toEqual([
      "a",
      "b",
    ]);
  });

  test("red_flags enforces session foreign key", () => {
    expect(() =>
      addRedFlag({ sessionId: "missing", flagType: "bad" }),
    ).toThrow();
  });
});

describe("domain score queries", () => {
  test("upsertDomainScore inserts a domain score", () => {
    seedSession();
    const score = upsertDomainScore({
      sessionId: "session-1",
      domain: "social_communication",
      rawScore: 12,
      maxScore: 100,
      weightedScore: 4.8,
      riskLevel: "low",
      calculatedAt: 7000,
    });

    expect(score).toMatchObject({
      sessionId: "session-1",
      domain: "social_communication",
      rawScore: 12,
      maxScore: 100,
      weightedScore: 4.8,
      riskLevel: "low",
      calculatedAt: 7000,
    });
  });

  test("upsertDomainScore updates an existing session/domain pair", () => {
    seedSession();
    upsertDomainScore({
      sessionId: "session-1",
      domain: "social_communication",
      rawScore: 12,
      riskLevel: "low",
    });
    const updated = upsertDomainScore({
      sessionId: "session-1",
      domain: "social_communication",
      rawScore: 46,
      riskLevel: "high",
    });

    expect(updated.rawScore).toBe(46);
    expect(updated.riskLevel).toBe("high");
    expect(getDomainScoresBySession("session-1")).toHaveLength(1);
  });

  test("getDomainScoresBySession returns domain scores", () => {
    seedSession();
    upsertDomainScore({ sessionId: "session-1", domain: "pretend_play" });
    upsertDomainScore({ sessionId: "session-1", domain: "sensory_processing" });

    expect(getDomainScoresBySession("session-1")).toHaveLength(2);
  });

  test("domain_scores enforces session foreign key", () => {
    expect(() =>
      upsertDomainScore({ sessionId: "missing", domain: "pretend_play" }),
    ).toThrow();
  });
});

describe("ML prediction queries", () => {
  test("upsertMlPrediction stores model output and feature metadata", () => {
    seedSession();
    const prediction = upsertMlPrediction({
      sessionId: "session-1",
      modelVersion: "rf_v1.0",
      modelType: "random_forest",
      asdProbability: 0.72,
      confidence: 0.81,
      consensusRisk: "high",
      featureVector: [1, 2, 3],
      featureNames: ["a", "b", "c"],
      shapValues: { a: 0.2 },
      predictedAt: 9000,
      inferenceMs: 42,
      serviceAvailable: true,
    });

    expect(prediction).toMatchObject({
      sessionId: "session-1",
      modelVersion: "rf_v1.0",
      modelType: "random_forest",
      asdProbability: 0.72,
      confidence: 0.81,
      consensusRisk: "high",
      featureVector: [1, 2, 3],
      featureNames: ["a", "b", "c"],
      shapValues: { a: 0.2 },
      predictedAt: 9000,
      inferenceMs: 42,
      serviceAvailable: true,
    });
  });

  test("upsertMlPrediction updates an existing session prediction", () => {
    seedSession();
    upsertMlPrediction({
      sessionId: "session-1",
      modelVersion: "rf_v1.0",
      modelType: "random_forest",
      asdProbability: 0.2,
      confidence: 0.6,
      consensusRisk: "low",
    });
    const updated = upsertMlPrediction({
      sessionId: "session-1",
      modelVersion: "rf_v1.1",
      modelType: "random_forest",
      asdProbability: 0.8,
      confidence: 0.9,
      consensusRisk: "high",
      serviceAvailable: false,
    });

    expect(updated.modelVersion).toBe("rf_v1.1");
    expect(updated.asdProbability).toBe(0.8);
    expect(updated.serviceAvailable).toBe(false);
    expect(getMlPredictionBySession("session-1").consensusRisk).toBe("high");
  });

  test("ml_predictions enforces session foreign key", () => {
    expect(() =>
      upsertMlPrediction({
        sessionId: "missing",
        modelVersion: "rf_v1.0",
        modelType: "random_forest",
        asdProbability: 0.5,
        confidence: 0.5,
        consensusRisk: "medium",
      }),
    ).toThrow();
  });

  test("deleting a session cascades to ML predictions", () => {
    seedSession();
    upsertMlPrediction({
      sessionId: "session-1",
      modelVersion: "rf_v1.0",
      modelType: "random_forest",
      asdProbability: 0.5,
      confidence: 0.5,
      consensusRisk: "medium",
    });

    deleteSession("session-1");

    expect(getMlPredictionBySession("session-1")).toBeNull();
  });
});
