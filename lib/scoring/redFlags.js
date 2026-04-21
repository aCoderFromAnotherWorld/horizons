import { addRedFlag, getRedFlagsBySession } from "@/lib/db/queries/redFlags.js";
import { getResponsesBySession } from "@/lib/db/queries/responses.js";

const RED_FLAG_DESCRIPTIONS = {
  negative_emotion_recognition_under_50:
    "Negative emotion recognition accuracy under 50%.",
  complete_absence_pretend_play:
    "Literal responses across pretend play recognition tasks.",
  extreme_sensory_4plus_distressing_sounds:
    "Distress response for four or more sounds.",
  rigid_pattern_plus_distress_at_change:
    "Rigid pattern response with distress at change.",
  poor_imitation_all_modalities: "Six or more imitation errors across modalities.",
};

function isNegativeEmotionResponse(response) {
  const extra = response.extraData || {};
  const selection = response.selection || {};
  const values = [
    extra.emotion,
    extra.targetEmotion,
    extra.category,
    selection.emotion,
    selection.targetEmotion,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return (
    response.taskKey.includes("ch2") &&
    values.some((value) =>
      ["sad", "scared", "fear", "fearful"].includes(value),
    )
  );
}

function isLiteralPretendResponse(response) {
  const selection = response.selection;
  const extra = response.extraData || {};
  return (
    response.chapter === 5 &&
    response.level === 1 &&
    (response.isCorrect === false ||
      selection === "literal" ||
      selection?.type === "literal" ||
      extra.responseType === "literal")
  );
}

function isDistressingSoundResponse(response) {
  const selection = response.selection;
  const value =
    typeof selection === "string"
      ? selection
      : selection?.rating || selection?.choice || selection?.type;
  const normalized = String(value || "").toLowerCase();
  return (
    response.chapter === 6 &&
    response.level === 1 &&
    (response.scorePoints >= 2 ||
      ["upset", "distressed", "cover_ears", "leave", "never"].includes(
        normalized,
      ))
  );
}

function hasRigidPatternDistress(response) {
  const extra = response.extraData || {};
  const selection = response.selection || {};
  return (
    response.chapter === 7 &&
    (extra.distressAtChange === true ||
      extra.rigidPatternPlusDistress === true ||
      selection.type === "rigid_distress" ||
      selection.responseType === "rigid_distress")
  );
}

function isImitationError(response) {
  return response.chapter === 8 && response.level === 1 && !response.isCorrect;
}

function saveFlag(sessionId, existingTypes, flagType) {
  if (existingTypes.has(flagType)) return null;
  existingTypes.add(flagType);
  return addRedFlag({
    sessionId,
    flagType,
    description: RED_FLAG_DESCRIPTIONS[flagType],
    severity: "moderate",
  });
}

/**
 * Detects configured red flags from response data and persists new flags.
 */
export function detectAndSaveRedFlags(sessionId) {
  const responses = getResponsesBySession(sessionId);
  const existing = getRedFlagsBySession(sessionId);
  const existingTypes = new Set(existing.map((flag) => flag.flagType));
  const saved = [];

  const negativeEmotionResponses = responses.filter(isNegativeEmotionResponse);
  if (negativeEmotionResponses.length) {
    const correct = negativeEmotionResponses.filter((row) => row.isCorrect).length;
    if (correct / negativeEmotionResponses.length < 0.5) {
      saved.push(
        saveFlag(
          sessionId,
          existingTypes,
          "negative_emotion_recognition_under_50",
        ),
      );
    }
  }

  const pretendResponses = responses.filter(
    (row) => row.chapter === 5 && row.level === 1,
  );
  if (
    pretendResponses.length >= 5 &&
    pretendResponses.every(isLiteralPretendResponse)
  ) {
    saved.push(
      saveFlag(sessionId, existingTypes, "complete_absence_pretend_play"),
    );
  }

  if (responses.filter(isDistressingSoundResponse).length >= 4) {
    saved.push(
      saveFlag(
        sessionId,
        existingTypes,
        "extreme_sensory_4plus_distressing_sounds",
      ),
    );
  }

  if (responses.some(hasRigidPatternDistress)) {
    saved.push(
      saveFlag(
        sessionId,
        existingTypes,
        "rigid_pattern_plus_distress_at_change",
      ),
    );
  }

  if (responses.filter(isImitationError).length >= 6) {
    saved.push(
      saveFlag(sessionId, existingTypes, "poor_imitation_all_modalities"),
    );
  }

  return saved.filter(Boolean);
}
