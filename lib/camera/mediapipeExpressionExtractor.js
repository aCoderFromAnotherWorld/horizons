const TASKS_VISION_BUNDLE_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/vision_bundle.js";
const TASKS_VISION_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm";
const FACE_LANDMARKER_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

const IRIS_LANDMARK_INDICES = [468, 469, 470, 471, 472, 473, 474, 475, 476, 477];

let extractorPromise;

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function average(...values) {
  const numbers = values.filter((value) => Number.isFinite(value));
  if (!numbers.length) return 0;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function blendshapeScore(scores, ...names) {
  return average(...names.map((name) => Number(scores[name] || 0)));
}

function normalizeScores(scores) {
  const normalized = {};
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  for (const [key, value] of Object.entries(scores)) {
    normalized[key] = total ? clamp01(value / total) : 0;
  }
  return normalized;
}

function mapBlendshapes(categories = []) {
  return Object.fromEntries(
    categories.map((category) => [category.categoryName, category.score]),
  );
}

function estimateExpressionScores(blendshapes) {
  const smile = blendshapeScore(blendshapes, "mouthSmileLeft", "mouthSmileRight");
  const frown = blendshapeScore(blendshapes, "mouthFrownLeft", "mouthFrownRight");
  const browDown = blendshapeScore(blendshapes, "browDownLeft", "browDownRight");
  const browInnerUp = Number(blendshapes.browInnerUp || 0);
  const jawOpen = Number(blendshapes.jawOpen || 0);
  const eyeWide = blendshapeScore(blendshapes, "eyeWideLeft", "eyeWideRight");
  const mouthPress = blendshapeScore(blendshapes, "mouthPressLeft", "mouthPressRight");
  const mouthStretch = blendshapeScore(
    blendshapes,
    "mouthStretchLeft",
    "mouthStretchRight",
  );

  return normalizeScores({
    happy: 0.1 + smile * 1.8,
    sad: 0.1 + frown * 1.2 + browInnerUp * 0.6,
    angry: 0.1 + browDown * 1.4 + mouthPress * 0.8,
    surprised: 0.1 + jawOpen * 1.2 + eyeWide * 0.9 + browInnerUp * 0.4,
    scared: 0.1 + eyeWide * 1.1 + mouthStretch * 0.8 + browInnerUp * 0.4,
    neutral:
      0.7 -
      Math.max(smile, frown, browDown, jawOpen, eyeWide, mouthStretch) * 0.6,
  });
}

function estimateGazeDirection(faceLandmarks = []) {
  const irisLandmarks = IRIS_LANDMARK_INDICES.map((index) => faceLandmarks[index]).filter(
    Boolean,
  );
  if (!irisLandmarks.length || !faceLandmarks.length) return null;

  const irisCenter = {
    x: average(...irisLandmarks.map((landmark) => landmark.x)),
    y: average(...irisLandmarks.map((landmark) => landmark.y)),
  };
  const faceCenter = {
    x: average(...faceLandmarks.map((landmark) => landmark.x)),
    y: average(...faceLandmarks.map((landmark) => landmark.y)),
  };

  return {
    x: Math.round((irisCenter.x - faceCenter.x) * 1000) / 1000,
    y: Math.round((irisCenter.y - faceCenter.y) * 1000) / 1000,
  };
}

function estimateHeadPose(transformationMatrixes = []) {
  const matrix = transformationMatrixes[0]?.data;
  if (!matrix?.length) return null;
  return {
    pitch: Math.round(Number(matrix[9] || 0) * 1000) / 1000,
    yaw: Math.round(Number(matrix[8] || 0) * 1000) / 1000,
    roll: Math.round(Number(matrix[1] || 0) * 1000) / 1000,
  };
}

async function loadTasksVision() {
  const visionModule = await import(
    /* webpackIgnore: true */ TASKS_VISION_BUNDLE_URL
  );
  return visionModule.default || visionModule;
}

async function createMediaPipeExpressionExtractor() {
  const vision = await loadTasksVision();
  const { FaceLandmarker, FilesetResolver } = vision;
  const filesetResolver = await FilesetResolver.forVisionTasks(TASKS_VISION_WASM_URL);
  const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: FACE_LANDMARKER_MODEL_URL,
    },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  });

  return {
    async extract(video, context = {}) {
      const result = faceLandmarker.detectForVideo(video, performance.now());
      const faceLandmarks = result.faceLandmarks?.[0];
      if (!faceLandmarks?.length) return null;

      const blendshapes = mapBlendshapes(
        result.faceBlendshapes?.[0]?.categories || [],
      );
      const blinkRate = blendshapeScore(
        blendshapes,
        "eyeBlinkLeft",
        "eyeBlinkRight",
      );

      return {
        faceLandmarks,
        irisLandmarks: IRIS_LANDMARK_INDICES.map((index) => faceLandmarks[index]).filter(
          Boolean,
        ),
        gazeDirection: estimateGazeDirection(faceLandmarks),
        blinkRate,
        headPose: estimateHeadPose(result.facialTransformationMatrixes),
        expressionScores: estimateExpressionScores(blendshapes),
        extraData: {
          extractor: "mediapipe-face-landmarker",
          source: "browser",
          taskKey: context.taskKey,
          blendshapes,
        },
      };
    },
  };
}

export function getMediaPipeExpressionExtractor() {
  if (!extractorPromise) {
    extractorPromise = createMediaPipeExpressionExtractor();
  }
  return extractorPromise;
}

export const __testing = {
  estimateExpressionScores,
  estimateGazeDirection,
  estimateHeadPose,
  mapBlendshapes,
};
