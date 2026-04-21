import { describe, expect, test } from "bun:test";

import {
  factualPatternPenalty,
  scoreConversationOption,
  scoreDiscoveryEvent,
  scoreGreetingStep,
} from "@/lib/scoring/chapter3.js";

describe("Chapter 3 greeting scoring", () => {
  test("no greeting initiated scores 3 points", () => {
    expect(scoreGreetingStep("knock", null, false)).toBe(3);
  });

  test("missing wave or smile scores 2 points", () => {
    expect(scoreGreetingStep("wave_smile", null, false)).toBe(2);
  });

  test("eye contact delay over 4 seconds scores 2 points", () => {
    expect(scoreGreetingStep("eye_contact", 4001, true)).toBe(2);
  });

  test("timely completed greeting step scores 0", () => {
    expect(scoreGreetingStep("eye_contact", 4000, true)).toBe(0);
    expect(scoreGreetingStep("knock", 1000, true)).toBe(0);
  });
});

describe("Chapter 3 conversation scoring", () => {
  test("off-topic response scores 3", () => {
    expect(scoreConversationOption("off-topic")).toBe(3);
  });

  test("literal response scores 2", () => {
    expect(scoreConversationOption("literal")).toBe(2);
  });

  test("timeout scores 2", () => {
    expect(scoreConversationOption(null, true)).toBe(2);
  });

  test("social and factual responses score 0 per item", () => {
    expect(scoreConversationOption("social")).toBe(0);
    expect(scoreConversationOption("factual")).toBe(0);
  });

  test("factual pattern penalty triggers at six of eight", () => {
    expect(factualPatternPenalty(6, 8)).toBe(5);
  });

  test("factual pattern penalty does not trigger below six", () => {
    expect(factualPatternPenalty(5, 8)).toBe(0);
  });
});

describe("Chapter 3 discovery scoring", () => {
  test("attending to friend discovery scores 0", () => {
    expect(
      scoreDiscoveryEvent({ eventType: "friend_finds", action: "attend" }),
    ).toBe(0);
  });

  test("not attending to friend discovery scores 2", () => {
    expect(
      scoreDiscoveryEvent({ eventType: "friend_finds", action: "timeout" }),
    ).toBe(2);
  });

  test("sharing own discovery scores 0", () => {
    expect(
      scoreDiscoveryEvent({ eventType: "child_finds", action: "share" }),
    ).toBe(0);
  });

  test("keeping own discovery scores 2", () => {
    expect(
      scoreDiscoveryEvent({ eventType: "child_finds", action: "keep" }),
    ).toBe(2);
  });

  test("excessive factual detail scores 1", () => {
    expect(
      scoreDiscoveryEvent({
        eventType: "child_finds",
        action: "factual_detail",
        excessiveFactualDetail: true,
      }),
    ).toBe(1);
  });
});
