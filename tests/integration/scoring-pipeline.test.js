import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";

import * as resultsRoute from "@/app/api/results/[sessionId]/route.js";
import { resetDbForTests, setDbForTests } from "@/lib/db/index.js";
import { createResponse } from "@/lib/db/queries/responses.js";
import { addChapterScore } from "@/lib/db/queries/scores.js";
import { createSession, getSession } from "@/lib/db/queries/sessions.js";
import { getDomainScoresBySession } from "@/lib/db/queries/domainScores.js";
import { getRedFlagsBySession } from "@/lib/db/queries/redFlags.js";
import { SCHEMA } from "@/lib/db/schema.js";

let db;

function makeRequest(path) {
  return new Request(`http://horizons.test${path}`);
}

async function fetchResults(sessionId) {
  const response = await resultsRoute.GET(
    makeRequest(`/api/results/${sessionId}`),
    { params: { sessionId } },
  );
  return {
    status: response.status,
    body: await response.json(),
  };
}

function seedSession(id, scores) {
  createSession({ id, playerAge: 6, startedAt: 1000 });
  for (const [chapterKey, rawPoints] of Object.entries(scores)) {
    addChapterScore({
      sessionId: id,
      chapterKey,
      rawPoints,
      recordedAt: 2000,
    });
  }
}

function addResponse(sessionId, body) {
  return createResponse({
    sessionId,
    chapter: 1,
    level: 1,
    taskKey: "pipeline_response",
    startedAt: 3000,
    ...body,
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

describe("full scoring pipeline", () => {
  test("aggregates chapter scores into domain raw scores", async () => {
    seedSession("aggregate-session", {
      ch1_baseline: 99,
      ch2_emotion: 10,
      ch3_social: 20,
      ch8_imitation: 30,
      ch4_executive: 15,
      ch7_pattern: 25,
      ch5_pretend: 8,
      ch6_sensory: 6,
    });

    const response = await fetchResults("aggregate-session");

    expect(response.status).toBe(200);
    expect(response.body.domainRawScores).toEqual({
      social_communication: 60,
      restricted_repetitive: 40,
      sensory_processing: 6,
      pretend_play: 8,
    });
  });

  test("calculates combined score and medium risk for balanced mock data", async () => {
    seedSession("balanced-session", {
      ch2_emotion: 10,
      ch3_social: 20,
      ch8_imitation: 30,
      ch4_executive: 15,
      ch7_pattern: 25,
      ch5_pretend: 8,
      ch6_sensory: 6,
    });

    const response = await fetchResults("balanced-session");

    expect(response.body.combinedScore).toBe(38.1);
    expect(response.body.riskLevel).toBe("medium");
  });

  test("persists all four domain score rows", async () => {
    seedSession("domain-session", {
      ch2_emotion: 5,
      ch3_social: 5,
      ch8_imitation: 5,
      ch4_executive: 5,
      ch7_pattern: 5,
      ch5_pretend: 5,
      ch6_sensory: 5,
    });

    const response = await fetchResults("domain-session");
    const domains = response.body.domainScores.map((score) => score.domain).sort();

    expect(domains).toEqual([
      "pretend_play",
      "restricted_repetitive",
      "sensory_processing",
      "social_communication",
    ]);
    expect(getDomainScoresBySession("domain-session")).toHaveLength(4);
  });

  test("marks the session completed when results are fetched", async () => {
    seedSession("complete-session", { ch2_emotion: 1 });

    await fetchResults("complete-session");
    const session = getSession("complete-session");

    expect(session.status).toBe("completed");
    expect(session.completedAt).toBeGreaterThan(0);
    expect(session.currentChapter).toBe(9);
  });

  test("low concern mock dataset returns low risk", async () => {
    seedSession("low-session", {
      ch2_emotion: 5,
      ch3_social: 4,
      ch8_imitation: 3,
      ch4_executive: 4,
      ch7_pattern: 3,
      ch5_pretend: 2,
      ch6_sensory: 2,
    });

    const response = await fetchResults("low-session");

    expect(response.body.combinedScore).toBe(7.5);
    expect(response.body.riskLevel).toBe("low");
  });

  test("high concern mock dataset returns very high risk", async () => {
    seedSession("high-session", {
      ch2_emotion: 80,
      ch3_social: 30,
      ch8_imitation: 20,
      ch4_executive: 50,
      ch7_pattern: 40,
      ch5_pretend: 40,
      ch6_sensory: 30,
    });

    const response = await fetchResults("high-session");

    expect(response.body.combinedScore).toBe(89.5);
    expect(response.body.riskLevel).toBe("very_high");
  });

  test("red flag multiplier is applied to combined score", async () => {
    seedSession("multiplier-session", {
      ch2_emotion: 20,
      ch3_social: 20,
      ch8_imitation: 10,
      ch4_executive: 20,
      ch5_pretend: 10,
      ch6_sensory: 10,
    });
    for (let index = 0; index < 6; index += 1) {
      addResponse("multiplier-session", {
        chapter: 8,
        level: 1,
        taskKey: `ch8_simple_error_${index}`,
        isCorrect: false,
      });
    }

    const response = await fetchResults("multiplier-session");

    expect(response.body.activeRedFlags).toContain("poor_imitation_all_modalities");
    expect(response.body.combinedScore).toBe(36.3);
  });

  test("negative emotion red flag is detected from sad and fear responses", async () => {
    seedSession("emotion-flag-session", { ch2_emotion: 10 });
    addResponse("emotion-flag-session", {
      chapter: 2,
      level: 1,
      taskKey: "ch2_emotion_sad",
      isCorrect: false,
      extraData: { emotion: "sad" },
    });
    addResponse("emotion-flag-session", {
      chapter: 2,
      level: 1,
      taskKey: "ch2_emotion_fear",
      isCorrect: false,
      extraData: { emotion: "scared" },
    });

    const response = await fetchResults("emotion-flag-session");

    expect(response.body.activeRedFlags).toContain(
      "negative_emotion_recognition_under_50",
    );
  });

  test("rigid pattern red flag is detected from Chapter 7 response metadata", async () => {
    seedSession("rigid-flag-session", { ch7_pattern: 10 });
    addResponse("rigid-flag-session", {
      chapter: 7,
      level: 1,
      taskKey: "ch7_pattern_ab",
      selection: { responseType: "rigid_distress" },
      isCorrect: false,
      extraData: {
        distressAtChange: true,
        returnedToFirstPattern: true,
      },
    });

    const response = await fetchResults("rigid-flag-session");

    expect(response.body.activeRedFlags).toContain(
      "rigid_pattern_plus_distress_at_change",
    );
    expect(getRedFlagsBySession("rigid-flag-session")).toHaveLength(1);
  });

  test("pipeline returns recommendation text and full red flag rows", async () => {
    seedSession("recommend-session", { ch5_pretend: 12 });
    for (let index = 0; index < 5; index += 1) {
      addResponse("recommend-session", {
        chapter: 5,
        level: 1,
        taskKey: `ch5_pretend_${index}`,
        selection: "literal",
        isCorrect: false,
        extraData: { responseType: "literal" },
      });
    }

    const response = await fetchResults("recommend-session");

    expect(response.body.recommendation).toBe(
      "Please consult a healthcare specialist for a proper evaluation.",
    );
    expect(response.body.redFlags[0]).toHaveProperty("flagType");
  });

  test("pipeline returns 404 for a missing session", async () => {
    const response = await fetchResults("missing-session");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Session not found");
  });
});
