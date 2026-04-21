const DEFAULT_ML_SERVICE_URL = "http://localhost:8000";

export async function callMlService(featureVector, { fetchImpl = fetch } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  const serviceUrl = process.env.ML_SERVICE_URL || DEFAULT_ML_SERVICE_URL;
  const serviceSecret = process.env.ML_SERVICE_SECRET || "";

  try {
    const response = await fetchImpl(`${serviceUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Service-Secret": serviceSecret,
      },
      body: JSON.stringify({ features: featureVector }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`ML service returned ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export function riskFromProbability(probability) {
  if (probability < 0.25) return "low";
  if (probability < 0.5) return "medium";
  if (probability < 0.75) return "high";
  return "very_high";
}

export function getConsensusRisk(ruleBasedRisk, mlProbability) {
  if (!Number.isFinite(mlProbability)) return ruleBasedRisk;

  const riskOrder = ["low", "medium", "high", "very_high"];
  const ruleIndex = riskOrder.indexOf(ruleBasedRisk);
  const mlIndex = riskOrder.indexOf(riskFromProbability(mlProbability));

  if (ruleIndex < 0 || mlIndex < 0) return ruleBasedRisk;
  if (Math.abs(ruleIndex - mlIndex) > 1) {
    return riskOrder[Math.max(ruleIndex, mlIndex)];
  }
  if (ruleIndex !== mlIndex) {
    return riskOrder[Math.round((ruleIndex + mlIndex) / 2)];
  }
  return ruleBasedRisk;
}

