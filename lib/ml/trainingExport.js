import { FEATURE_NAMES, extractFeatureVector } from "@/lib/ml/featureExtractor.js";

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const stringValue =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${stringValue.replaceAll('"', '""')}"`;
}

export function parseLabelMap(labelsParam) {
  if (!labelsParam) return {};
  const parsed = JSON.parse(labelsParam);
  return Object.fromEntries(
    Object.entries(parsed).map(([sessionId, label]) => [
      sessionId,
      Number(label),
    ]),
  );
}

export function buildTrainingRows({
  sessions,
  labelBySessionId,
  extractFeatureVectorImpl = extractFeatureVector,
}) {
  return sessions
    .filter((session) => labelBySessionId[session.id] !== undefined)
    .map((session) => {
      const { featureVector } = extractFeatureVectorImpl(session.id);
      return {
        sessionId: session.id,
        playerAge: session.playerAge,
        completed: Boolean(session.completedAt || session.status === "completed"),
        cameraEnabled: Boolean(session.cameraEnabled),
        featureVector,
        label: Number(labelBySessionId[session.id]),
      };
    });
}

export function trainingRowsToCsv(rows) {
  const headers = ["session_id", ...FEATURE_NAMES, "label"];
  const lines = rows.map((row) =>
    [
      row.sessionId,
      ...FEATURE_NAMES.map((_, index) => row.featureVector[index] ?? 0),
      row.label,
    ]
      .map(csvEscape)
      .join(","),
  );
  return [headers.join(","), ...lines].join("\n");
}

export function getTrainingDataQuality(rows) {
  const totalSessions = rows.length;
  const classBalance = rows.reduce(
    (balance, row) => {
      balance[row.label] = (balance[row.label] || 0) + 1;
      return balance;
    },
    { 0: 0, 1: 0 },
  );
  const ageDistribution = rows.reduce((distribution, row) => {
    const age = row.playerAge ?? "unknown";
    distribution[age] = (distribution[age] || 0) + 1;
    return distribution;
  }, {});
  const completedCount = rows.filter((row) => row.completed).length;
  const cameraFrameIndex = FEATURE_NAMES.indexOf("camera_frame_count");
  const missingCameraCount = rows.filter(
    (row) => (row.featureVector[cameraFrameIndex] || 0) === 0,
  ).length;

  return {
    totalSessions,
    classBalance,
    ageDistribution,
    completionRate: totalSessions ? completedCount / totalSessions : 0,
    missingCameraDataRate: totalSessions ? missingCameraCount / totalSessions : 0,
  };
}

