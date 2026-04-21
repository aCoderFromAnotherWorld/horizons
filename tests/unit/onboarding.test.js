import { describe, expect, test } from "bun:test";

import {
  normalizePlayerName,
  startOnboardingSession,
} from "@/lib/onboarding.js";

describe("onboarding flow helper", () => {
  test("normalizes optional child name", () => {
    expect(normalizePlayerName(" Ari ")).toBe("Ari");
    expect(normalizePlayerName("   ")).toBeNull();
  });

  test("creates a session and returns the chapter-1 route", async () => {
    const calls = [];
    const fetchImpl = async (url, init) => {
      calls.push({ url, body: JSON.parse(init.body) });
      return Response.json(
        {
          sessionId: "onboarding-session",
          session: {
            id: "onboarding-session",
            playerAge: 6,
            playerName: "Ari",
          },
        },
        { status: 201 },
      );
    };

    const result = await startOnboardingSession({
      playerAge: 6,
      playerName: " Ari ",
      fetchImpl,
    });

    expect(calls[0]).toEqual({
      url: "/api/session",
      body: {
        playerAge: 6,
        playerName: "Ari",
        cameraEnabled: false,
        cameraConsentAt: null,
        cameraConsentVersion: null,
      },
    });
    expect(result).toMatchObject({
      sessionId: "onboarding-session",
      route: "/chapter-1",
    });
  });

  test("passes camera consent fields when enabled", async () => {
    const calls = [];
    const fetchImpl = async (url, init) => {
      calls.push({ url, body: JSON.parse(init.body) });
      return Response.json(
        {
          sessionId: "camera-session",
          session: {
            id: "camera-session",
            playerAge: 7,
            playerName: null,
            cameraEnabled: true,
            cameraConsentAt: 5000,
            cameraConsentVersion: "camera-consent-v1",
          },
        },
        { status: 201 },
      );
    };

    await startOnboardingSession({
      playerAge: 7,
      playerName: "",
      cameraEnabled: true,
      cameraConsentAt: 5000,
      cameraConsentVersion: "camera-consent-v1",
      fetchImpl,
    });

    expect(calls[0].body).toEqual({
      playerAge: 7,
      playerName: null,
      cameraEnabled: true,
      cameraConsentAt: 5000,
      cameraConsentVersion: "camera-consent-v1",
    });
  });
});
