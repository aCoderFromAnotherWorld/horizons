/**
 * API integration tests.
 *
 * These call route handlers directly, bypassing HTTP, so no server needs to run.
 * The DB connection uses DATABASE_URL_TEST (preferred) or DATABASE_URL.
 *
 * Run: DATABASE_URL_TEST=<test_db_url> bun test tests/integration/api.test.js
 */

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';

// ---------------------------------------------------------------------------
// TestRequest: standard Request with a nextUrl shim for Next.js route handlers.
// ---------------------------------------------------------------------------
class TestRequest extends Request {
  constructor(url, init) {
    super(url, init);
    this._url = new URL(url);
  }

  get nextUrl() {
    return this._url;
  }
}

function makeReq(path, { method = 'GET', body, headers = {} } = {}) {
  const url = `http://localhost${path}`;
  const init = { method, headers: { 'Content-Type': 'application/json', ...headers } };
  if (body !== undefined) init.body = JSON.stringify(body);
  return new TestRequest(url, init);
}

// ---------------------------------------------------------------------------
// Lazy-import route handlers (db singleton reads env at import time)
// ---------------------------------------------------------------------------
let sessionPOST, sessionGET, sessionPATCH;
let responsePOST, scorePOST, flagPOST;
let contactPOST, surveyPOST;
let dashSessionsGET, dashAccountsGET;

const createdSessionIds = [];

beforeAll(async () => {
  const sessionMod     = await import('../../app/api/game/session/route.js');
  const sessionIdMod   = await import('../../app/api/game/session/[id]/route.js');
  const responseMod    = await import('../../app/api/game/response/route.js');
  const scoreMod       = await import('../../app/api/game/score/route.js');
  const flagMod        = await import('../../app/api/game/flag/route.js');
  const contactMod     = await import('../../app/api/platform/contact/route.js');
  const surveyMod      = await import('../../app/api/platform/survey/route.js');
  const dashSessMod    = await import('../../app/api/dashboard/sessions/route.js');
  const dashAccMod     = await import('../../app/api/dashboard/accounts/route.js');

  sessionPOST   = sessionMod.POST;
  sessionGET    = sessionIdMod.GET;
  sessionPATCH  = sessionIdMod.PATCH;
  responsePOST  = responseMod.POST;
  scorePOST     = scoreMod.POST;
  flagPOST      = flagMod.POST;
  contactPOST   = contactMod.POST;
  surveyPOST    = surveyMod.POST;
  dashSessionsGET  = dashSessMod.GET;
  dashAccountsGET  = dashAccMod.GET;
});

afterAll(async () => {
  // Best-effort cleanup: delete sessions created during tests.
  if (createdSessionIds.length === 0) return;
  try {
    const { default: sql } = await import('../../lib/db/index.js');
    await sql`DELETE FROM game_sessions WHERE id = ANY(${createdSessionIds}::text[])`;
  } catch {
    // Ignore cleanup errors — test DB may not be available.
  }
});

// ---------------------------------------------------------------------------
// POST /api/game/session
// ---------------------------------------------------------------------------
describe('POST /api/game/session', () => {
  it('creates a session with valid playerAge', async () => {
    const req = makeReq('/api/game/session', {
      method: 'POST',
      body: { playerAge: 7, sensoryLevel: 'medium', guideChoice: '🦊' },
    });
    const res = await sessionPOST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(typeof data.sessionId).toBe('string');
    expect(data.sessionId).toHaveLength(36);
    createdSessionIds.push(data.sessionId);
  });

  it('returns 400 when playerAge is below minimum (2)', async () => {
    const req = makeReq('/api/game/session', {
      method: 'POST',
      body: { playerAge: 2 },
    });
    const res = await sessionPOST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  it('returns 400 when playerAge is above maximum (11)', async () => {
    const req = makeReq('/api/game/session', {
      method: 'POST',
      body: { playerAge: 11 },
    });
    const res = await sessionPOST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when playerAge is missing', async () => {
    const req = makeReq('/api/game/session', {
      method: 'POST',
      body: { sensoryLevel: 'low' },
    });
    const res = await sessionPOST(req);
    expect(res.status).toBe(400);
  });

  it('accepts playerAge at the minimum boundary (3)', async () => {
    const req = makeReq('/api/game/session', {
      method: 'POST',
      body: { playerAge: 3 },
    });
    const res = await sessionPOST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    createdSessionIds.push(data.sessionId);
  });

  it('accepts playerAge at the maximum boundary (10)', async () => {
    const req = makeReq('/api/game/session', {
      method: 'POST',
      body: { playerAge: 10 },
    });
    const res = await sessionPOST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    createdSessionIds.push(data.sessionId);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/game/session/[id]
// ---------------------------------------------------------------------------
describe('PATCH /api/game/session/[id]', () => {
  let testSessionId;

  beforeAll(async () => {
    const req = makeReq('/api/game/session', {
      method: 'POST',
      body: { playerAge: 6 },
    });
    const res = await sessionPOST(req);
    const data = await res.json();
    testSessionId = data.sessionId;
    createdSessionIds.push(testSessionId);
  });

  it('updates status to "completed"', async () => {
    const req = makeReq(`/api/game/session/${testSessionId}`, {
      method: 'PATCH',
      body: { status: 'completed' },
    });
    const res = await sessionPATCH(req, { params: Promise.resolve({ id: testSessionId }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it('updates currentChapter and currentLevel', async () => {
    const req = makeReq(`/api/game/session/${testSessionId}`, {
      method: 'PATCH',
      body: { currentChapter: 3, currentLevel: 2 },
    });
    const res = await sessionPATCH(req, { params: Promise.resolve({ id: testSessionId }) });
    expect(res.status).toBe(200);
  });

  it('returns 404 for non-existent session', async () => {
    const req = makeReq('/api/game/session/nonexistent-id-xyz', {
      method: 'PATCH',
      body: { status: 'active' },
    });
    const res = await sessionPATCH(req, {
      params: Promise.resolve({ id: 'nonexistent-id-xyz' }),
    });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// POST /api/game/response
// ---------------------------------------------------------------------------
describe('POST /api/game/response', () => {
  let testSessionId;

  beforeAll(async () => {
    const req = makeReq('/api/game/session', {
      method: 'POST',
      body: { playerAge: 5 },
    });
    const res = await sessionPOST(req);
    const data = await res.json();
    testSessionId = data.sessionId;
    createdSessionIds.push(testSessionId);
  });

  it('records a task response successfully', async () => {
    const req = makeReq('/api/game/response', {
      method: 'POST',
      body: {
        sessionId: testSessionId,
        chapter: 2,
        level: 1,
        taskKey: 'ch2_l1_emotion_match_1',
        startedAt: Date.now(),
        responseTimeMs: 1200,
        isCorrect: true,
        attemptNumber: 1,
        scorePoints: 0,
      },
    });
    const res = await responsePOST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(typeof data.id).toBe('number');
  });

  it('returns 400 when sessionId is missing', async () => {
    const req = makeReq('/api/game/response', {
      method: 'POST',
      body: { chapter: 1, level: 1, taskKey: 'test', startedAt: Date.now() },
    });
    const res = await responsePOST(req);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/game/score
// ---------------------------------------------------------------------------
describe('POST /api/game/score', () => {
  let testSessionId;

  beforeAll(async () => {
    const req = makeReq('/api/game/session', {
      method: 'POST',
      body: { playerAge: 8 },
    });
    const res = await sessionPOST(req);
    const data = await res.json();
    testSessionId = data.sessionId;
    createdSessionIds.push(testSessionId);
  });

  it('records a chapter score successfully', async () => {
    const req = makeReq('/api/game/score', {
      method: 'POST',
      body: { sessionId: testSessionId, chapterKey: 'ch2_emotion', rawPoints: 12 },
    });
    const res = await scorePOST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it('returns 400 when chapterKey is missing', async () => {
    const req = makeReq('/api/game/score', {
      method: 'POST',
      body: { sessionId: testSessionId, rawPoints: 5 },
    });
    const res = await scorePOST(req);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/game/flag
// ---------------------------------------------------------------------------
describe('POST /api/game/flag', () => {
  let testSessionId;

  beforeAll(async () => {
    const req = makeReq('/api/game/session', {
      method: 'POST',
      body: { playerAge: 4 },
    });
    const res = await sessionPOST(req);
    const data = await res.json();
    testSessionId = data.sessionId;
    createdSessionIds.push(testSessionId);
  });

  it('records a red flag successfully', async () => {
    const req = makeReq('/api/game/flag', {
      method: 'POST',
      body: {
        sessionId: testSessionId,
        flagType: 'extreme_sensory_distress',
        severity: 'moderate',
        description: 'Test flag',
      },
    });
    const res = await flagPOST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(typeof data.id).toBe('number');
  });

  it('returns 400 when flagType is missing', async () => {
    const req = makeReq('/api/game/flag', {
      method: 'POST',
      body: { sessionId: testSessionId },
    });
    const res = await flagPOST(req);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/platform/contact
// ---------------------------------------------------------------------------
describe('POST /api/platform/contact', () => {
  it('accepts a valid contact submission', async () => {
    const req = makeReq('/api/platform/contact', {
      method: 'POST',
      body: {
        name: 'Test User',
        email: 'test@example.com',
        role: 'caregiver',
        message: 'This is a test message for integration testing.',
      },
    });
    const res = await contactPOST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it('returns 400 when email is missing', async () => {
    const req = makeReq('/api/platform/contact', {
      method: 'POST',
      body: { message: 'Test message here' },
    });
    const res = await contactPOST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when message is too short (< 5 chars)', async () => {
    const req = makeReq('/api/platform/contact', {
      method: 'POST',
      body: { email: 'test@example.com', message: 'Hi' },
    });
    const res = await contactPOST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when email is invalid format', async () => {
    const req = makeReq('/api/platform/contact', {
      method: 'POST',
      body: { email: 'not-an-email', message: 'Test message here' },
    });
    const res = await contactPOST(req);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/platform/survey
// ---------------------------------------------------------------------------
describe('POST /api/platform/survey', () => {
  it('records a survey response with rating 3', async () => {
    const req = makeReq('/api/platform/survey', {
      method: 'POST',
      body: { rating: 3, role: 'researcher', feedback: 'Integration test survey' },
    });
    const res = await surveyPOST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it('accepts ratings at the minimum boundary (1)', async () => {
    const req = makeReq('/api/platform/survey', {
      method: 'POST',
      body: { rating: 1 },
    });
    const res = await surveyPOST(req);
    expect(res.status).toBe(201);
  });

  it('accepts ratings at the maximum boundary (5)', async () => {
    const req = makeReq('/api/platform/survey', {
      method: 'POST',
      body: { rating: 5 },
    });
    const res = await surveyPOST(req);
    expect(res.status).toBe(201);
  });

  it('returns 400 when rating is missing', async () => {
    const req = makeReq('/api/platform/survey', {
      method: 'POST',
      body: { role: 'caregiver' },
    });
    const res = await surveyPOST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when rating is out of range (6)', async () => {
    const req = makeReq('/api/platform/survey', {
      method: 'POST',
      body: { rating: 6 },
    });
    const res = await surveyPOST(req);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/dashboard/sessions — requires auth
// ---------------------------------------------------------------------------
describe('GET /api/dashboard/sessions (auth-gated)', () => {
  it('returns 401 when no session cookie is provided', async () => {
    const req = makeReq('/api/dashboard/sessions');
    const res = await dashSessionsGET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// GET /api/dashboard/accounts — requires admin
// ---------------------------------------------------------------------------
describe('GET /api/dashboard/accounts (admin-gated)', () => {
  it('returns 401 or 403 when no session cookie is provided', async () => {
    const req = makeReq('/api/dashboard/accounts');
    const res = await dashAccountsGET(req);
    expect([401, 403]).toContain(res.status);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });
});
