import { describe, expect, test } from "bun:test";

import {
  callMlService,
  getConsensusRisk,
  riskFromProbability,
} from "@/lib/ml/mlClient.js";

describe("ML client helpers", () => {
  test("riskFromProbability maps probabilities to risk bands", () => {
    expect(riskFromProbability(0.1)).toBe("low");
    expect(riskFromProbability(0.3)).toBe("medium");
    expect(riskFromProbability(0.6)).toBe("high");
    expect(riskFromProbability(0.9)).toBe("very_high");
  });

  test("getConsensusRisk anchors on rule-based risk and limits small disagreements", () => {
    expect(getConsensusRisk("medium", 0.7)).toBe("high");
    expect(getConsensusRisk("high", 0.3)).toBe("high");
    expect(getConsensusRisk("low", 0.9)).toBe("very_high");
    expect(getConsensusRisk("medium", Number.NaN)).toBe("medium");
  });

  test("callMlService posts features and returns service JSON", async () => {
    const calls = [];
    const result = await callMlService([1, 2, 3], {
      fetchImpl: async (url, init) => {
        calls.push({ url, body: JSON.parse(init.body) });
        return Response.json({
          asd_probability: 0.7,
          confidence: 0.8,
          model_version: "rf_v1.0",
        });
      },
    });

    expect(calls[0].url).toBe("http://localhost:8000/predict");
    expect(calls[0].body).toEqual({ features: [1, 2, 3] });
    expect(result.asd_probability).toBe(0.7);
  });

  test("callMlService throws on non-OK responses", async () => {
    await expect(
      callMlService([1], {
        fetchImpl: async () => Response.json({ error: "down" }, { status: 503 }),
      }),
    ).rejects.toThrow("ML service returned 503");
  });
});
