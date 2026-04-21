export const AGE_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10];

export function normalizePlayerName(playerName) {
  const normalized = String(playerName || "").trim();
  return normalized || null;
}

export async function startOnboardingSession({
  playerAge,
  playerName,
  fetchImpl = fetch,
}) {
  const response = await fetchImpl("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playerAge,
      playerName: normalizePlayerName(playerName),
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not start session");
  return {
    sessionId: data.sessionId,
    session: data.session,
    route: "/chapter-1",
  };
}
