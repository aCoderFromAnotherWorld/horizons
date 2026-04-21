import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";

import * as authRoute from "@/app/api/researcher/auth/route.js";
import * as exportRoute from "@/app/researcher/export/route.js";
import { resetDbForTests, setDbForTests } from "@/lib/db/index.js";
import { createResponse } from "@/lib/db/queries/responses.js";
import { addChapterScore } from "@/lib/db/queries/scores.js";
import { createSession } from "@/lib/db/queries/sessions.js";
import { SCHEMA } from "@/lib/db/schema.js";

let db;
let originalPassword;

function makeJsonRequest(path, body) {
  return new Request(`http://horizons.test${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(path) {
  return new Request(`http://horizons.test${path}`);
}

function seedResearcherSession() {
  createSession({
    id: "research-session",
    playerAge: 7,
    playerName: "Mira",
    startedAt: 1000,
    completedAt: 61000,
    status: "completed",
  });
  addChapterScore({
    sessionId: "research-session",
    chapterKey: "ch2_emotion",
    rawPoints: 10,
  });
  createResponse({
    sessionId: "research-session",
    chapter: 2,
    level: 1,
    taskKey: "ch2_emotion_test",
    startedAt: 2000,
    responseTimeMs: 1500,
    selection: "happy",
    isCorrect: true,
    scorePoints: 0,
    extraData: { emotion: "happy" },
  });
}

beforeEach(() => {
  originalPassword = process.env.RESEARCHER_PASSWORD;
  process.env.RESEARCHER_PASSWORD = "test-password";
  db = new Database(":memory:");
  db.exec(SCHEMA);
  db.exec("PRAGMA foreign_keys = ON;");
  setDbForTests(db);
});

afterEach(() => {
  if (originalPassword === undefined) {
    delete process.env.RESEARCHER_PASSWORD;
  } else {
    process.env.RESEARCHER_PASSWORD = originalPassword;
  }
  resetDbForTests();
  db.close();
});

describe("researcher authentication", () => {
  test("accepts the configured researcher password", async () => {
    const response = await authRoute.POST(
      makeJsonRequest("/api/researcher/auth", { password: "test-password" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.authenticated).toBe(true);
  });

  test("rejects an invalid researcher password", async () => {
    const response = await authRoute.POST(
      makeJsonRequest("/api/researcher/auth", { password: "wrong" }),
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Invalid password");
  });
});

describe("researcher export route", () => {
  test("exports full session JSON", async () => {
    seedResearcherSession();

    const response = await exportRoute.GET(
      makeGetRequest("/researcher/export?sessionId=research-session&format=json"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toContain(
      "horizons-research-session.json",
    );
    expect(body.session.id).toBe("research-session");
    expect(body.responses).toHaveLength(1);
    expect(body.scores).toHaveLength(1);
    expect(body.results.combinedScore).toBeGreaterThan(0);
  });

  test("exports task responses as CSV", async () => {
    seedResearcherSession();

    const response = await exportRoute.GET(
      makeGetRequest("/researcher/export?sessionId=research-session&format=csv"),
    );
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/csv");
    expect(text).toContain("taskKey");
    expect(text).toContain("ch2_emotion_test");
  });

  test("returns 404 for missing export session", async () => {
    const response = await exportRoute.GET(
      makeGetRequest("/researcher/export?sessionId=missing&format=json"),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Session not found");
  });

  test("rejects unsupported export format", async () => {
    seedResearcherSession();

    const response = await exportRoute.GET(
      makeGetRequest("/researcher/export?sessionId=research-session&format=xml"),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Unsupported format");
  });
});
