export function scoreGreetingStep(stepId, responseTimeMs, completed) {
  if (!completed) {
    if (stepId === "knock") return 3;
    if (stepId === "wave_smile") return 2;
    return 2;
  }
  if (stepId === "eye_contact" && responseTimeMs > 4000) return 2;
  return 0;
}

export function scoreConversationOption(type, timedOut = false) {
  if (timedOut) return 2;
  if (type === "off-topic") return 3;
  if (type === "literal") return 2;
  return 0;
}

export function factualPatternPenalty(factualCount, totalExchanges = 8) {
  return totalExchanges >= 8 && factualCount >= 6 ? 5 : 0;
}

export function scoreDiscoveryEvent({ eventType, action, excessiveFactualDetail }) {
  if (eventType === "friend_finds") {
    return action === "attend" ? 0 : 2;
  }
  if (action === "share") return 0;
  return excessiveFactualDetail ? 1 : 2;
}
