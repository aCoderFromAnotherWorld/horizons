import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";

import * as flagRoute from "@/app/api/flag/route.js";
import * as mouseRoute from "@/app/api/mouse/route.js";
import * as responseRoute from "@/app/api/response/route.js";
import * as resultsRoute from "@/app/api/results/[sessionId]/route.js";
import * as scoreRoute from "@/app/api/score/route.js";
import * as sessionRoute from "@/app/api/session/route.js";
import * as sessionIdRoute from "@/app/api/session/[id]/route.js";
import { resetDbForTests, setDbForTests } from "@/lib/db/index.js";
import { SCHEMA } from "@/lib/db/schema.js";
import { getResponsesBySession } from "@/lib/db/queries/responses.js";

let db;
let nextHttpPort = 43100;

function makeRequest(method, path, body) {
  return new Request(`http://horizons.test${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function fetchRoute(handler, { method = "GET", path = "/", body, params = {} } = {}) {
  const response = await handler(makeRequest(method, path, body), { params });
  return {
    status: response.status,
    body: await response.json(),
  };
}

function routeRequest(request) {
  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method;

  if (pathname === "/api/session") {
    if (method === "GET") return sessionRoute.GET(request);
    if (method === "POST") return sessionRoute.POST(request);
  }

  const sessionMatch = pathname.match(/^\/api\/session\/([^/]+)$/);
  if (sessionMatch) {
    const context = { params: { id: sessionMatch[1] } };
    if (method === "GET") return sessionIdRoute.GET(request, context);
    if (method === "PATCH") return sessionIdRoute.PATCH(request, context);
    if (method === "DELETE") return sessionIdRoute.DELETE(request, context);
  }

  if (pathname === "/api/response" && method === "POST") {
    return responseRoute.POST(request);
  }
  if (pathname === "/api/score" && method === "POST") {
    return scoreRoute.POST(request);
  }
  if (pathname === "/api/mouse" && method === "POST") {
    return mouseRoute.POST(request);
  }
  if (pathname === "/api/flag" && method === "POST") {
    return flagRoute.POST(request);
  }

  const resultsMatch = pathname.match(/^\/api\/results\/([^/]+)$/);
  if (resultsMatch && method === "GET") {
    return resultsRoute.GET(request, {
      params: { sessionId: resultsMatch[1] },
    });
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}

function startHttpApiServer() {
  nextHttpPort += 1;
  return Bun.serve({
    hostname: "127.0.0.1",
    port: nextHttpPort,
    fetch: routeRequest,
  });
}

async function fetchHttpJson(server, path, { method = "GET", body } = {}) {
  const response = await fetch(`http://127.0.0.1:${server.port}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: response.status,
    body: await response.json(),
  };
}

async function createApiSession(id = "api-session") {
  return fetchRoute(sessionRoute.POST, {
    method: "POST",
    path: "/api/session",
    body: {
      id,
      playerAge: 6,
      playerName: "Ari",
      startedAt: 1000,
    },
  });
}

async function addApiScore(sessionId, chapterKey, rawPoints) {
  return fetchRoute(scoreRoute.POST, {
    method: "POST",
    path: "/api/score",
    body: { sessionId, chapterKey, rawPoints, recordedAt: 2000 },
  });
}

async function addApiResponse(body) {
  return fetchRoute(responseRoute.POST, {
    method: "POST",
    path: "/api/response",
    body: {
      sessionId: "api-session",
      chapter: 1,
      level: 1,
      taskKey: "task",
      startedAt: 1000,
      ...body,
    },
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

describe("session API routes", () => {
  test("POST /api/session creates a session", async () => {
    const response = await createApiSession();

    expect(response.status).toBe(201);
    expect(response.body.sessionId).toBe("api-session");
    expect(response.body.session.playerAge).toBe(6);
  });

  test("GET /api/session lists sessions", async () => {
    await createApiSession();

    const response = await fetchRoute(sessionRoute.GET, {
      path: "/api/session",
    });

    expect(response.status).toBe(200);
    expect(response.body.sessions).toHaveLength(1);
  });

  test("GET /api/session/[id] returns a session", async () => {
    await createApiSession();

    const response = await fetchRoute(sessionIdRoute.GET, {
      path: "/api/session/api-session",
      params: { id: "api-session" },
    });

    expect(response.status).toBe(200);
    expect(response.body.session.id).toBe("api-session");
  });

  test("GET /api/session/[id] returns 404 for a missing session", async () => {
    const response = await fetchRoute(sessionIdRoute.GET, {
      path: "/api/session/missing",
      params: { id: "missing" },
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Session not found");
  });

  test("PATCH /api/session/[id] updates progress", async () => {
    await createApiSession();

    const response = await fetchRoute(sessionIdRoute.PATCH, {
      method: "PATCH",
      path: "/api/session/api-session",
      params: { id: "api-session" },
      body: {
        currentChapter: 4,
        currentLevel: 2,
        status: "active",
        avatarData: { hair: 1 },
      },
    });

    expect(response.status).toBe(200);
    expect(response.body.session.currentChapter).toBe(4);
    expect(response.body.session.avatarData).toEqual({ hair: 1 });
  });

  test("DELETE /api/session/[id] deletes a session", async () => {
    await createApiSession();

    const response = await fetchRoute(sessionIdRoute.DELETE, {
      method: "DELETE",
      path: "/api/session/api-session",
      params: { id: "api-session" },
    });

    expect(response.status).toBe(200);
    expect(response.body.deleted).toBe(true);
  });
});

describe("HTTP API routes via Bun fetch", () => {
  let server;

  beforeEach(() => {
    server = startHttpApiServer();
  });

  afterEach(() => {
    server?.stop(true);
    server = null;
  });

  test("POST and GET /api/session work over HTTP fetch", async () => {
    const created = await fetchHttpJson(server, "/api/session", {
      method: "POST",
      body: {
        id: "http-session",
        playerAge: 7,
        playerName: "Mira",
        startedAt: 1234,
      },
    });
    expect(created.status).toBe(201);
    expect(created.body.sessionId).toBe("http-session");

    const listed = await fetchHttpJson(server, "/api/session");
    expect(listed.status).toBe(200);
    expect(listed.body.sessions.map((session) => session.id)).toContain(
      "http-session",
    );
  });

  test("PATCH /api/session/[id] persists avatar data over HTTP fetch", async () => {
    await fetchHttpJson(server, "/api/session", {
      method: "POST",
      body: { id: "avatar-session", playerAge: 6, startedAt: 1000 },
    });

    const patched = await fetchHttpJson(server, "/api/session/avatar-session", {
      method: "PATCH",
      body: {
        avatarData: {
          hair: 2,
          clothes: 1,
          hairColor: 3,
          clothesColor: 4,
        },
      },
    });

    expect(patched.status).toBe(200);
    expect(patched.body.session.avatarData).toEqual({
      hair: 2,
      clothes: 1,
      hairColor: 3,
      clothesColor: 4,
    });
  });

  test("full scoring route works over HTTP fetch", async () => {
    await fetchHttpJson(server, "/api/session", {
      method: "POST",
      body: { id: "http-results", playerAge: 6, startedAt: 1000 },
    });
    await fetchHttpJson(server, "/api/score", {
      method: "POST",
      body: {
        sessionId: "http-results",
        chapterKey: "ch6_sensory",
        rawPoints: 10,
      },
    });

    const results = await fetchHttpJson(server, "/api/results/http-results");

    expect(results.status).toBe(200);
    expect(results.body.domainRawScores.sensory_processing).toBe(10);
    expect(results.body.riskLevel).toBe("low");
  });
});

describe("data collection API routes", () => {
  test("POST /api/response logs a task response", async () => {
    await createApiSession();

    const response = await addApiResponse({
      chapter: 2,
      level: 1,
      taskKey: "ch2_emotion_match_1",
      selection: "happy",
      isCorrect: true,
      scorePoints: 0,
    });

    expect(response.status).toBe(201);
    expect(response.body.response.taskKey).toBe("ch2_emotion_match_1");
  });

  test("POST /api/response returns 400 for an invalid session", async () => {
    const response = await addApiResponse({ sessionId: "missing" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeTruthy();
  });

  test("POST /api/score logs chapter score points", async () => {
    await createApiSession();

    const response = await addApiScore("api-session", "ch2_emotion", 12);

    expect(response.status).toBe(201);
    expect(response.body.score.rawPoints).toBe(12);
  });

  test("POST /api/mouse logs a movement batch", async () => {
    await createApiSession();

    const response = await fetchRoute(mouseRoute.POST, {
      method: "POST",
      path: "/api/mouse",
      body: {
        sessionId: "api-session",
        taskKey: "ch2_emotion_match_1",
        movements: [
          { x: 10, y: 20, t: 100 },
          { x: 12, y: 21, t: 200 },
        ],
      },
    });

    expect(response.status).toBe(201);
    expect(response.body.inserted).toBe(2);
  });

  test("POST /api/flag logs a red flag", async () => {
    await createApiSession();

    const response = await fetchRoute(flagRoute.POST, {
      method: "POST",
      path: "/api/flag",
      body: {
        sessionId: "api-session",
        flagType: "complete_absence_pretend_play",
        description: "All literal",
        severity: "severe",
      },
    });

    expect(response.status).toBe(201);
    expect(response.body.flag.severity).toBe("severe");
  });
});

describe("results API route", () => {
  async function seedResultsData() {
    await createApiSession();
    await addApiScore("api-session", "ch2_emotion", 10);
    await addApiScore("api-session", "ch3_social", 10);
    await addApiScore("api-session", "ch4_executive", 10);
    await addApiScore("api-session", "ch7_pattern", 5);
    await addApiScore("api-session", "ch5_pretend", 10);
    await addApiScore("api-session", "ch6_sensory", 10);
    await addApiScore("api-session", "ch8_imitation", 12);

    for (let i = 0; i < 6; i += 1) {
      await addApiResponse({
        chapter: 8,
        level: 1,
        taskKey: `ch8_imitation_${i}`,
        isCorrect: false,
      });
    }
  }

  test("GET /api/results/[sessionId] triggers scoring", async () => {
    await seedResultsData();

    const response = await fetchRoute(resultsRoute.GET, {
      path: "/api/results/api-session",
      params: { sessionId: "api-session" },
    });

    expect(response.status).toBe(200);
    expect(response.body.domainRawScores).toEqual({
      social_communication: 32,
      restricted_repetitive: 15,
      sensory_processing: 10,
      pretend_play: 10,
    });
  });

  test("GET /api/results/[sessionId] returns combined score and risk", async () => {
    await seedResultsData();

    const response = await fetchRoute(resultsRoute.GET, {
      path: "/api/results/api-session",
      params: { sessionId: "api-session" },
    });

    expect(response.body.combinedScore).toBe(25.4);
    expect(response.body.riskLevel).toBe("medium");
  });

  test("GET /api/results/[sessionId] detects red flags", async () => {
    await seedResultsData();

    const response = await fetchRoute(resultsRoute.GET, {
      path: "/api/results/api-session",
      params: { sessionId: "api-session" },
    });

    expect(response.body.redFlags.map((flag) => flag.flagType)).toContain(
      "poor_imitation_all_modalities",
    );
  });

  test("GET /api/results/[sessionId] returns persisted domain scores", async () => {
    await seedResultsData();

    const response = await fetchRoute(resultsRoute.GET, {
      path: "/api/results/api-session",
      params: { sessionId: "api-session" },
    });

    expect(response.body.domainScores).toHaveLength(4);
    expect(response.body.domainScores[0]).toHaveProperty("riskLevel");
  });

  test("GET /api/results/[sessionId] returns recommendation text", async () => {
    await seedResultsData();

    const response = await fetchRoute(resultsRoute.GET, {
      path: "/api/results/api-session",
      params: { sessionId: "api-session" },
    });

    expect(response.body.recommendation).toBe(
      "Please consult a healthcare specialist for a proper evaluation.",
    );
  });

  test("GET /api/results/[sessionId] returns 404 for a missing session", async () => {
    const response = await fetchRoute(resultsRoute.GET, {
      path: "/api/results/missing",
      params: { sessionId: "missing" },
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Session not found");
  });

  test("full session lifecycle deletes cascaded responses", async () => {
    await createApiSession();
    await addApiResponse({ taskKey: "ch2_before_delete" });

    await fetchRoute(sessionIdRoute.DELETE, {
      method: "DELETE",
      path: "/api/session/api-session",
      params: { id: "api-session" },
    });

    expect(getResponsesBySession("api-session")).toEqual([]);
  });
});
