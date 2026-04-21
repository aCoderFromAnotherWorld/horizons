# TODO: Camera-Based ML ASD Screening Implementation

This plan implements the refined camera-based screening idea as an additive layer on top of the existing game, scoring engine, SQLite database, and researcher dashboard. The core rule-based screening flow remains available even when camera or ML services are disabled.

## Phase 0: Baseline Safety Check

- [x] Confirm current app health before changes.
  - [x] Run `bun test`.
  - [x] Run `bun run lint`.
  - [x] Run `bun run build`.
- [x] Keep current SQLite query API stable unless a later phase explicitly migrates storage.
- [x] Confirm `.env` / `.env.local` values for researcher auth and optional ML service URL.

## Phase 1: Camera Data Schema

- [x] Add camera frame storage to the backend.
  - [x] Extend SQLite schema with a `camera_frames` table.
  - [x] Store only derived data: landmarks, expression scores, gaze/head-pose metadata.
  - [x] Do not store raw video frames or images.
- [x] Add `lib/db/queries/cameraFrames.js`.
  - [x] `saveCameraFrame(frame)`.
  - [x] `getCameraFramesBySession(sessionId)`.
  - [x] `getCameraFramesByTask(sessionId, taskKey)`.
- [x] Add unit tests for camera frame persistence.

## Phase 2: Camera Capture API

- [x] Add `app/api/camera/route.js`.
  - [x] Validate `sessionId`, `taskKey`, and timestamp fields.
  - [x] Accept facial landmarks and expression scores.
  - [x] Return non-fatal success/failure because camera data is optional.
- [x] Add integration tests for `/api/camera`.
- [x] Ensure failed camera logging never blocks gameplay.

## Phase 3: Consent And Session Settings

- [x] Add session fields for camera consent.
  - [x] `cameraEnabled`.
  - [x] `cameraConsentAt`.
  - [x] `cameraConsentVersion`.
- [x] Add caregiver-facing consent UI before camera-enabled gameplay.
- [x] Add a clear skip path.
- [x] Persist consent state in session and Zustand store.
- [x] Keep camera disabled by default.

## Phase 4: Browser Camera Component

- [x] Add `components/game/CameraCapture.jsx`.
  - [x] Request camera only after consent.
  - [x] Run only when `active={true}`.
  - [x] Stop camera tracks on unmount.
  - [x] Hide the video element from the child UI.
- [ ] Integrate MediaPipe or a local face-expression library.
  - [ ] Extract facial landmarks.
  - [ ] Extract expression probabilities.
  - [ ] Optionally extract blink rate, gaze direction, and head pose.
- [x] Batch or throttle uploads to `/api/camera`.
- [x] Add graceful fallback for unavailable camera, permission denial, or model load failure.

## Phase 5: Attach Camera To Clinical Moments

- [x] Activate camera only during clinically relevant tasks.
  - [x] Chapter 1 Level 1: response to name.
  - [x] Chapter 1 Level 2: guide pointing / joint attention.
  - [x] Chapter 2 Levels 1-2: emotion recognition and expression mirror.
  - [x] Chapter 3 Level 1: greeting and simulated eye contact.
  - [x] Chapter 5 Level 1: pretend play recognition.
  - [x] Chapter 8 Level 1: imitation tasks, if pose support is added.
- [x] Include `taskKey`, `chapterId`, and `levelId` in each camera payload.
- [x] Verify gameplay remains usable without camera data.

## Phase 6: Camera Feature Extraction

- [x] Add `lib/ml/cameraFeatureExtractor.js`.
  - [x] `expression_flatness`.
  - [x] `expression_mirror_accuracy`.
  - [x] `gaze_to_face_ratio`, if gaze is available.
  - [x] `eye_contact_duration_ms`, if gaze is available.
  - [x] `avg_blink_rate`, if blink detection is available.
  - [x] `head_pose_variability`, if head pose is available.
- [x] Add deterministic tests using mock camera frames.
- [x] Return zero/null-safe defaults when camera data is missing.

## Phase 7: Behavioral Feature Extraction

- [x] Add `lib/ml/featureExtractor.js`.
  - [x] Reuse existing responses, scores, red flags, mouse movements, and camera features.
  - [x] Return a stable ordered feature vector.
  - [x] Export feature names with the vector.
- [x] Add tests to lock feature order and feature count.
- [ ] Add a development export route or script for training CSV generation.

## Phase 8: ML Prediction Storage

- [x] Add `ml_predictions` storage.
  - [x] `sessionId`.
  - [x] `modelVersion`.
  - [x] `modelType`.
  - [x] `asdProbability`.
  - [x] `confidence`.
  - [x] `consensusRisk`.
  - [x] `featureVector`.
  - [x] `featureNames`.
  - [x] `shapValues`.
  - [x] `predictedAt`.
  - [x] `serviceAvailable`.
- [x] Add `lib/db/queries/mlPredictions.js`.
- [x] Add unit tests for prediction persistence.

## Phase 9: Python ML Service Scaffold

- [x] Create `ml-service/`.
  - [x] `main.py` with `/health` and `/predict`.
  - [x] `train.py` for supervised model training.
  - [x] `requirements.txt`.
  - [x] `models/` placeholder with `.gitkeep`.
  - [x] `README.md` with setup and training instructions.
- [x] Start with a baseline model.
  - [x] Logistic Regression for interpretability.
  - [x] Random Forest for non-linear behavior.
- [x] Save model, scaler/pipeline, feature names, thresholds, and training metrics.

## Phase 10: Training Dataset Workflow

- [x] Define required training label.
  - [x] `0`: non-ASD / typical development.
  - [x] `1`: ASD confirmed by clinician or validated clinical assessment.
- [x] Do not use the rule-based score as the ML label.
- [ ] Add CSV export for labeled sessions.
- [ ] Add data quality checks.
  - [ ] Missing camera data rate.
  - [ ] Session completion rate.
  - [ ] Age distribution.
  - [ ] Class balance.
- [ ] Split data into train, validation, and holdout test sets.
- [ ] Report ROC-AUC, sensitivity, specificity, precision, recall, calibration, and confusion matrix.

## Phase 11: Next.js ML Client

- [x] Add `lib/ml/mlClient.js`.
  - [x] POST feature vector to `ML_SERVICE_URL`.
  - [x] Include timeout and service-secret support.
  - [x] Degrade gracefully when the ML service is offline.
- [x] Add consensus risk helper.
  - [x] Rule-based score remains the anchor.
  - [x] ML can add a separate probability and consensus recommendation.
- [x] Add tests for consensus logic and offline fallback.

## Phase 12: Results API Integration

- [x] Update `app/api/results/[sessionId]/route.js`.
  - [x] Run existing rule-based scoring first.
  - [x] Extract behavioral and camera features.
  - [x] Call ML service when configured.
  - [x] Store ML prediction.
  - [x] Return additive `ml` field without removing existing response fields.
- [ ] Add integration tests for:
  - [ ] ML service available.
  - [x] ML service unavailable.
  - [x] No camera consent.
  - [x] Missing camera data.

## Phase 13: Researcher Dashboard UI

- [x] Add ML risk summary to researcher session detail.
  - [x] ASD probability.
  - [x] Model confidence.
  - [x] Model version.
  - [ ] Rule-based risk vs ML risk vs consensus risk.
  - [ ] Camera data availability.
- [ ] Add SHAP or feature-importance chart when returned by the ML service.
- [ ] Add clear non-diagnostic language.
- [ ] Keep current domain score and red-flag displays visible.

## Phase 14: Privacy And Clinical Safeguards

- [x] Confirm no raw images or video frames are stored.
- [x] Add documentation describing camera data fields.
- [x] Add deletion coverage for camera frames and ML predictions when deleting a session.
- [x] Add researcher-facing warning that ML output is screening support, not diagnosis.
- [x] Version consent text and model metadata.

## Phase 15: Verification

- [x] Run full checks.
  - [x] `bun test`.
  - [x] `bun run lint`.
  - [x] `bun run build`.
- [x] Manually test a full game session without camera.
- [x] Manually test a camera-enabled session with consent.
- [x] Manually test camera permission denial.
- [x] Manually test results generation with ML service offline.
- [x] Manually test results generation with ML service online.

## Phase 16: Optional MongoDB Migration

- [ ] Revisit MongoDB only if cloud multi-site deployment or large-scale data collection requires it.
- [ ] Preserve query function names if migration happens.
- [ ] Convert all DB callers to async.
- [ ] Re-run all tests and build after migration.
