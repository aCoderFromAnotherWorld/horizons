export function countSequenceErrors(order, correctOrder) {
  return order.reduce(
    (count, itemId, index) => count + (itemId === correctOrder[index] ? 0 : 1),
    0,
  );
}

export function shuffleRoutineCards(cards, random = Math.random) {
  const shuffled = [...cards];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  if (
    shuffled.length > 1 &&
    shuffled.every((card, index) => card.id === cards[index].id)
  ) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

export function scoreRoutineAttempt(sequenceErrors, attemptNumber) {
  const incompletePenalty = sequenceErrors > 0 && attemptNumber >= 3 ? 3 : 0;
  return sequenceErrors + incompletePenalty;
}

export function scoreDisruptionResponse(type, responseTimeMs) {
  const base = type === "flexible" ? 0 : type === "distress" ? 2 : 3;
  return base + (responseTimeMs > 10000 ? 1 : 0);
}

export function countActivityRepeats(selections) {
  return selections.reduce((counts, activityId) => {
    counts[activityId] = (counts[activityId] || 0) + 1;
    return counts;
  }, {});
}

export function hasSameActivityThreePlus(selections) {
  return Object.values(countActivityRepeats(selections)).some((count) => count >= 3);
}

export function hasExactSameSequence(selections) {
  if (selections.length < 4) return false;
  return new Set(selections).size === 1;
}

export function scorePlaygroundChoices(selections, transitionDelaysMs) {
  let points = 0;
  if (hasSameActivityThreePlus(selections)) points += 3;
  if (hasExactSameSequence(selections)) points += 2;
  points += transitionDelaysMs.filter((delay) => delay > 8000).length * 2;
  return points;
}

export function scoreUnexpectedResponse(type, responseTimeMs) {
  const base = type === "flexible" ? 0 : type === "distress" ? 2 : 3;
  return base + (responseTimeMs > 12000 ? 1 : 0);
}
