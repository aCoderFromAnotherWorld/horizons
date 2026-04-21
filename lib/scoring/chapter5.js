export function scorePretendRecognition(selectionType, timedOut = false) {
  if (timedOut) return 1;
  return selectionType === "literal" ? 2 : 0;
}

export function shouldFlagCompleteAbsencePretendPlay(literalCount, totalTrials) {
  return totalTrials > 0 && literalCount === totalTrials;
}

export function countSymbolicSelections(selectedObjects) {
  return selectedObjects.filter((object) => !object.isLiteral).length;
}

export function countLiteralSelections(selectedObjects) {
  return selectedObjects.filter((object) => object.isLiteral).length;
}

export function symbolicSelectionRatio(selectedObjects) {
  if (!selectedObjects.length) return 0;
  return countSymbolicSelections(selectedObjects) / selectedObjects.length;
}

export function hasRigidRepetitiveUse(selectedObjects) {
  if (selectedObjects.length < 3) return false;
  const counts = selectedObjects.reduce((acc, object) => {
    acc[object.name] = (acc[object.name] || 0) + 1;
    return acc;
  }, {});
  return Object.values(counts).some((count) => count >= 3);
}

export function scorePretendCreation(selectedObjects, responseTimeMs, timedOut = false) {
  let points = 0;
  const symbolicCount = countSymbolicSelections(selectedObjects);

  if (selectedObjects.length === 0) {
    points += 3;
  } else if (symbolicCount === 0) {
    points += 4;
  } else if (hasRigidRepetitiveUse(selectedObjects)) {
    points += 2;
  }

  if (responseTimeMs > 15000) points += 1;
  return points;
}
