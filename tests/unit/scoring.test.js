import { beforeEach, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";

import { setDbForTests } from "@/lib/db/index.js";
import { SCHEMA } from "@/lib/db/schema.js";
import { createSession } from "@/lib/db/queries/sessions.js";
import { createResponse } from "@/lib/db/queries/responses.js";
import { addChapterScore } from "@/lib/db/queries/scores.js";
import { getRedFlagsBySession } from "@/lib/db/queries/redFlags.js";
import { aggregateDomainScores, CHAPTER_TO_DOMAIN } from "@/lib/scoring/domains.js";
import {
  calcAvgAttempts,
  calcGameAccuracy,
  calculateCombinedScore,
  getDomainRisk,
  getRiskLevel,
} from "@/lib/scoring/engine.js";
import { detectAndSaveRedFlags } from "@/lib/scoring/redFlags.js";
import {
  DOMAIN_MAX_POINTS,
  DOMAIN_THRESHOLDS,
  DOMAIN_WEIGHTS,
  RED_FLAG_MULTIPLIERS,
} from "@/lib/scoring/thresholds.js";

let db;

function resetDb() {
  db?.close();
  db = new Database(":memory:");
  db.exec(SCHEMA);
  db.exec("PRAGMA foreign_keys = ON;");
  setDbForTests(db);
}

function seedScoringSession() {
  createSession({ id: "score-session", startedAt: 1000 });
}

beforeEach(() => {
  resetDb();
});

describe("threshold constants", () => {
  test("domain weights match AGENTS.md", () => {
    expect(DOMAIN_WEIGHTS).toEqual({
      social_communication: 0.4,
      restricted_repetitive: 0.3,
      sensory_processing: 0.15,
      pretend_play: 0.15,
    });
  });

  test("domain max points match AGENTS.md", () => {
    expect(DOMAIN_MAX_POINTS).toEqual({
      social_communication: 100,
      restricted_repetitive: 70,
      sensory_processing: 30,
      pretend_play: 40,
    });
  });

  test("domain thresholds include very high social communication", () => {
    expect(DOMAIN_THRESHOLDS.social_communication.very_high).toEqual([
      66,
      Infinity,
    ]);
  });

  test("chapter to domain map excludes baseline and summary", () => {
    expect(CHAPTER_TO_DOMAIN.ch1_baseline).toBeNull();
    expect(CHAPTER_TO_DOMAIN.ch9_summary).toBeNull();
  });
});

describe("combined score", () => {
  test("calculateCombinedScore weights raw domain scores", () => {
    expect(
      calculateCombinedScore(
        {
          social_communication: 35,
          restricted_repetitive: 18,
          sensory_processing: 10,
          pretend_play: 8,
        },
        [],
      ),
    ).toBe(22.1);
  });

  test("calculateCombinedScore treats missing domains as zero", () => {
    expect(calculateCombinedScore({ social_communication: 10 }, [])).toBe(4);
  });

  test("calculateCombinedScore ignores unknown red flags", () => {
    expect(
      calculateCombinedScore({ social_communication: 10 }, ["unknown_flag"]),
    ).toBe(4);
  });

  test("negative emotion multiplier is applied", () => {
    expect(
      calculateCombinedScore(
        { social_communication: 10 },
        ["negative_emotion_recognition_under_50"],
      ),
    ).toBe(4.8);
  });

  test("pretend play multiplier is applied", () => {
    expect(
      calculateCombinedScore(
        { social_communication: 10 },
        ["complete_absence_pretend_play"],
      ),
    ).toBe(5.2);
  });

  test("sensory multiplier is applied", () => {
    expect(
      calculateCombinedScore(
        { social_communication: 10 },
        ["extreme_sensory_4plus_distressing_sounds"],
      ),
    ).toBe(4.6);
  });

  test("rigid pattern multiplier is applied", () => {
    expect(
      calculateCombinedScore(
        { social_communication: 10 },
        ["rigid_pattern_plus_distress_at_change"],
      ),
    ).toBe(4.8);
  });

  test("poor imitation multiplier is applied", () => {
    expect(
      calculateCombinedScore(
        { social_communication: 10 },
        ["poor_imitation_all_modalities"],
      ),
    ).toBe(5);
  });

  test("red flag multipliers stack multiplicatively", () => {
    expect(
      calculateCombinedScore(
        { social_communication: 20 },
        [
          "negative_emotion_recognition_under_50",
          "complete_absence_pretend_play",
        ],
      ),
    ).toBe(12.5);
  });

  test("red flag multiplier stack caps at 2x", () => {
    expect(
      calculateCombinedScore(
        { social_communication: 100 },
        [
          "negative_emotion_recognition_under_50",
          "complete_absence_pretend_play",
          "extreme_sensory_4plus_distressing_sounds",
          "rigid_pattern_plus_distress_at_change",
          "poor_imitation_all_modalities",
        ],
      ),
    ).toBe(80);
  });
});

describe("risk classification", () => {
  test("getRiskLevel classifies 25 as low", () => {
    expect(getRiskLevel(25)).toBe("low");
  });

  test("getRiskLevel classifies 26 as medium", () => {
    expect(getRiskLevel(26)).toBe("medium");
  });

  test("getRiskLevel classifies 45 as medium", () => {
    expect(getRiskLevel(45)).toBe("medium");
  });

  test("getRiskLevel classifies 46 as high", () => {
    expect(getRiskLevel(46)).toBe("high");
  });

  test("getRiskLevel classifies 65 as high", () => {
    expect(getRiskLevel(65)).toBe("high");
  });

  test("getRiskLevel classifies 66 as very high", () => {
    expect(getRiskLevel(66)).toBe("very_high");
  });

  test("getDomainRisk classifies social communication thresholds", () => {
    expect(getDomainRisk("social_communication", 20)).toBe("low");
    expect(getDomainRisk("social_communication", 21)).toBe("medium");
    expect(getDomainRisk("social_communication", 46)).toBe("high");
    expect(getDomainRisk("social_communication", 66)).toBe("very_high");
  });

  test("getDomainRisk classifies restricted repetitive thresholds", () => {
    expect(getDomainRisk("restricted_repetitive", 15)).toBe("low");
    expect(getDomainRisk("restricted_repetitive", 16)).toBe("medium");
    expect(getDomainRisk("restricted_repetitive", 31)).toBe("high");
  });

  test("getDomainRisk classifies sensory thresholds", () => {
    expect(getDomainRisk("sensory_processing", 8)).toBe("low");
    expect(getDomainRisk("sensory_processing", 9)).toBe("medium");
    expect(getDomainRisk("sensory_processing", 16)).toBe("high");
  });

  test("getDomainRisk classifies pretend play thresholds", () => {
    expect(getDomainRisk("pretend_play", 10)).toBe("low");
    expect(getDomainRisk("pretend_play", 11)).toBe("medium");
    expect(getDomainRisk("pretend_play", 21)).toBe("high");
  });

  test("getDomainRisk returns unknown for unknown domains", () => {
    expect(getDomainRisk("missing", 1)).toBe("unknown");
  });
});

describe("research formulas", () => {
  test("calcGameAccuracy returns 0 when total moves is zero", () => {
    expect(calcGameAccuracy(10, 0)).toBe(0);
  });

  test("calcGameAccuracy rounds 10 of 15 to 0.667 in reporting precision", () => {
    expect(Number(calcGameAccuracy(10, 15).toFixed(3))).toBe(0.667);
  });

  test("calcAvgAttempts returns 0 when total questions is zero", () => {
    expect(calcAvgAttempts(18, 0)).toBe(0);
  });

  test("calcAvgAttempts computes DTT average attempts", () => {
    expect(calcAvgAttempts(18, 12)).toBe(1.5);
  });
});

describe("domain aggregation", () => {
  test("aggregateDomainScores computes all four domain raw scores", () => {
    seedScoringSession();
    addChapterScore({
      sessionId: "score-session",
      chapterKey: "ch2_emotion",
      rawPoints: 10,
    });
    addChapterScore({
      sessionId: "score-session",
      chapterKey: "ch3_social",
      rawPoints: 5,
    });
    addChapterScore({
      sessionId: "score-session",
      chapterKey: "ch4_executive",
      rawPoints: 7,
    });
    addChapterScore({
      sessionId: "score-session",
      chapterKey: "ch7_pattern",
      rawPoints: 6,
    });
    addChapterScore({
      sessionId: "score-session",
      chapterKey: "ch5_pretend",
      rawPoints: 3,
    });
    addChapterScore({
      sessionId: "score-session",
      chapterKey: "ch6_sensory",
      rawPoints: 4,
    });
    addChapterScore({
      sessionId: "score-session",
      chapterKey: "ch1_baseline",
      rawPoints: 99,
    });

    const { rawScores } = aggregateDomainScores("score-session");

    expect(rawScores).toEqual({
      social_communication: 15,
      restricted_repetitive: 13,
      sensory_processing: 4,
      pretend_play: 3,
    });
  });

  test("aggregateDomainScores persists weighted domain scores", () => {
    seedScoringSession();
    addChapterScore({
      sessionId: "score-session",
      chapterKey: "ch2_emotion",
      rawPoints: 10,
    });

    const { domainScores } = aggregateDomainScores("score-session");

    expect(domainScores.social_communication.weightedScore).toBe(4);
    expect(domainScores.social_communication.maxScore).toBe(100);
  });
});

describe("red flag detection", () => {
  test("red flag multiplier constants include all configured flags", () => {
    expect(Object.keys(RED_FLAG_MULTIPLIERS)).toHaveLength(5);
  });

  test("detectAndSaveRedFlags saves low negative emotion accuracy", () => {
    seedScoringSession();
    for (let i = 0; i < 4; i += 1) {
      createResponse({
        sessionId: "score-session",
        chapter: 2,
        level: 1,
        taskKey: `ch2_negative_${i}`,
        startedAt: 100 + i,
        isCorrect: i === 0,
        extraData: { emotion: i % 2 ? "sad" : "scared" },
      });
    }

    detectAndSaveRedFlags("score-session");

    expect(getRedFlagsBySession("score-session")[0].flagType).toBe(
      "negative_emotion_recognition_under_50",
    );
  });

  test("detectAndSaveRedFlags excludes angry from sad/fear red flag inputs", () => {
    seedScoringSession();
    for (let i = 0; i < 4; i += 1) {
      createResponse({
        sessionId: "score-session",
        chapter: 2,
        level: 1,
        taskKey: `ch2_angry_${i}`,
        startedAt: 100 + i,
        isCorrect: false,
        extraData: { emotion: "angry" },
      });
    }

    detectAndSaveRedFlags("score-session");

    expect(getRedFlagsBySession("score-session")).toEqual([]);
  });

  test("detectAndSaveRedFlags ignores chapter 4 routine disruption for pattern red flag", () => {
    seedScoringSession();
    createResponse({
      sessionId: "score-session",
      chapter: 4,
      level: 1,
      taskKey: "ch4_disruption_clean-shirt-wash",
      startedAt: 100,
      selection: "distress",
      isCorrect: false,
      extraData: { redFlagCandidate: true },
    });

    detectAndSaveRedFlags("score-session");

    expect(getRedFlagsBySession("score-session")).toEqual([]);
  });

  test("detectAndSaveRedFlags saves complete absence pretend play", () => {
    seedScoringSession();
    for (let i = 0; i < 5; i += 1) {
      createResponse({
        sessionId: "score-session",
        chapter: 5,
        level: 1,
        taskKey: `ch5_pretend_${i}`,
        startedAt: 100 + i,
        isCorrect: false,
        selection: "literal",
      });
    }

    detectAndSaveRedFlags("score-session");

    expect(
      getRedFlagsBySession("score-session").some(
        (flag) => flag.flagType === "complete_absence_pretend_play",
      ),
    ).toBe(true);
  });

  test("detectAndSaveRedFlags saves sensory distress flag", () => {
    seedScoringSession();
    for (let i = 0; i < 4; i += 1) {
      createResponse({
        sessionId: "score-session",
        chapter: 6,
        level: 1,
        taskKey: `ch6_sound_${i}`,
        startedAt: 100 + i,
        selection: "upset",
        scorePoints: 2,
      });
    }

    detectAndSaveRedFlags("score-session");

    expect(
      getRedFlagsBySession("score-session").some(
        (flag) =>
          flag.flagType === "extreme_sensory_4plus_distressing_sounds",
      ),
    ).toBe(true);
  });

  test("detectAndSaveRedFlags saves rigid pattern distress flag", () => {
    seedScoringSession();
    createResponse({
      sessionId: "score-session",
      chapter: 7,
      level: 1,
      taskKey: "ch7_pattern_distress",
      startedAt: 100,
      extraData: { distressAtChange: true },
    });

    detectAndSaveRedFlags("score-session");

    expect(
      getRedFlagsBySession("score-session").some(
        (flag) => flag.flagType === "rigid_pattern_plus_distress_at_change",
      ),
    ).toBe(true);
  });

  test("detectAndSaveRedFlags saves poor imitation flag", () => {
    seedScoringSession();
    for (let i = 0; i < 6; i += 1) {
      createResponse({
        sessionId: "score-session",
        chapter: 8,
        level: 1,
        taskKey: `ch8_imitation_${i}`,
        startedAt: 100 + i,
        isCorrect: false,
      });
    }

    detectAndSaveRedFlags("score-session");

    expect(
      getRedFlagsBySession("score-session").some(
        (flag) => flag.flagType === "poor_imitation_all_modalities",
      ),
    ).toBe(true);
  });
});
