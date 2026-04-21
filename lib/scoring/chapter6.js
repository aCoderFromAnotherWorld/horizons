export function isDistressingSoundRating(rating) {
  return ["worried", "upset", "cover_ears", "leave"].includes(rating);
}

export function scoreSoundRating(rating, soundCategory) {
  const baseScores = {
    happy: 0,
    neutral: 0,
    worried: 1,
    upset: 2,
    cover_ears: 3,
    leave: 4,
  };
  let points = baseScores[rating] ?? 0;
  if (soundCategory === "mechanical" && isDistressingSoundRating(rating)) {
    points += 2;
  }
  return points;
}

export function scoreSoundSummary({ distressCount, coverEarsCount, leaveCount }) {
  let points = 0;
  if (distressCount >= 4) points += 3;
  if (coverEarsCount >= 3) points += 2;
  if (leaveCount >= 2) points += 3;
  return points;
}

export function shouldFlagExtremeSoundSensitivity(distressCount) {
  return distressCount >= 4;
}

export function scoreVisualRooms(roomVisits, allRooms) {
  const visitedIds = new Set(roomVisits.map((visit) => visit.roomId));
  const avoidedCount = allRooms.filter((room) => !visitedIds.has(room.id)).length;
  const quickMotionExits = roomVisits.filter(
    (visit) =>
      ["flickering", "spinning"].includes(visit.type) && visit.durationMs < 3000,
  ).length;
  const longPatternRooms = roomVisits.filter(
    (visit) =>
      ["spinning", "stripes"].includes(visit.type) && visit.durationMs > 60000,
  ).length;
  const crowdedDistress = roomVisits.some(
    (visit) => visit.type === "crowded" && visit.leftEarly,
  );

  return {
    avoidedCount,
    quickMotionExits,
    longPatternRooms,
    crowdedDistress,
    points:
      (avoidedCount >= 3 ? 2 : 0) +
      quickMotionExits * 2 +
      longPatternRooms +
      (crowdedDistress ? 1 : 0),
  };
}

export function isAversiveTextureRating(rating) {
  return ["dont_like", "never_touch", "wont_try"].includes(rating);
}

export function scoreTextureRating(rating) {
  const scores = {
    love: 0,
    okay: 0,
    dont_like: 1,
    never_touch: 2,
    wont_try: 3,
  };
  return scores[rating] ?? 0;
}

export function scoreTextureSummary(assignments, textures) {
  const aversiveCount = assignments.filter((assignment) =>
    isAversiveTextureRating(assignment.rating),
  ).length;
  const refusesCount = assignments.filter(
    (assignment) =>
      assignment.rating === "never_touch" || assignment.rating === "wont_try",
  ).length;
  const wetTextureIds = textures
    .filter((texture) => texture.category === "wet")
    .map((texture) => texture.id);
  const wetAssignments = assignments.filter((assignment) =>
    wetTextureIds.includes(assignment.textureId),
  );
  const allWetAversive =
    wetAssignments.length === wetTextureIds.length &&
    wetAssignments.every((assignment) => isAversiveTextureRating(assignment.rating));

  return {
    aversiveCount,
    refusesCount,
    allWetAversive,
    points:
      (aversiveCount >= 4 ? 2 : 0) +
      (allWetAversive ? 2 : 0) +
      (refusesCount >= 2 ? 2 : 0),
  };
}
