# Camera Data Notes

Camera capture is optional and caregiver-consent gated.

The application must not store raw camera images, video frames, screenshots, or pixel buffers. Camera capture should run in the browser and send only derived metadata to `/api/camera`.

The browser extractor uses MediaPipe FaceLandmarker through `components/game/CameraCapture.jsx` and `lib/camera/mediapipeExpressionExtractor.js`. It derives facial landmarks, iris landmarks, approximate gaze direction, blink signal, head-pose signal, and heuristic expression scores from FaceLandmarker blendshapes.

## Stored Fields

The `camera_frames` table stores:

- `session_id`
- `task_key`
- `chapter`
- `level`
- `captured_at`
- `face_landmarks`
- `iris_landmarks`
- `pose_landmarks`
- `gaze_direction`
- `blink_rate`
- `head_pose`
- `expression_scores`
- `extra_data`

All landmark and expression fields are JSON metadata. They are intended for post-session feature extraction and ML screening support.

## Consent Fields

The `sessions` table stores:

- `camera_enabled`
- `camera_consent_at`
- `camera_consent_version`

Camera is disabled by default. If camera permission is denied, unavailable, or the extraction model is missing, gameplay must continue normally.

## ML Use

Camera-derived features currently include expression flatness, expression mirror accuracy, gaze-to-face ratio, eye-contact duration estimate, blink rate, and head-pose variability. These are screening-support signals only and are not diagnostic.
