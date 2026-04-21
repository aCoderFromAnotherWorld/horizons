"use client";

import { useEffect, useRef } from "react";

import {
  buildCameraFramePayload,
  hasCameraDerivedData,
} from "@/lib/camera/framePayload";
import { getMediaPipeExpressionExtractor } from "@/lib/camera/mediapipeExpressionExtractor";

async function defaultExtractor(video, context) {
  const customExtractor = globalThis.window?.horizonsCameraExtractor;
  if (customExtractor?.extract) return customExtractor.extract(video, context);
  const extractor = await getMediaPipeExpressionExtractor();
  return extractor.extract(video, context);
}

export default function CameraCapture({
  sessionId,
  taskKey,
  chapterId,
  levelId,
  active = false,
  captureEveryMs = 500,
  extractor = defaultExtractor,
  onError,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const stoppedRef = useRef(false);
  const lastErrorRef = useRef("");

  function postCameraDiagnostic(event, details = {}) {
    fetch("/api/camera", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        taskKey,
        chapter: chapterId,
        level: levelId,
        capturedAt: Date.now(),
        extraData: {
          event,
          source: "CameraCapture",
          ...details,
        },
      }),
    }).catch(() => {});
  }

  function handleCameraError(error, event = "camera_error") {
    const message = error?.message || String(error);
    if (lastErrorRef.current !== message) {
      lastErrorRef.current = message;
      console.warn("[Horizons camera]", message);
      postCameraDiagnostic(event, { message });
    }
    onError?.(error);
  }

  useEffect(() => {
    if (!active || !sessionId || !taskKey) return undefined;
    if (!navigator?.mediaDevices?.getUserMedia) {
      handleCameraError(
        new Error("Camera is not available in this browser"),
        "camera_unavailable",
      );
      return undefined;
    }
    stoppedRef.current = false;
    lastErrorRef.current = "";

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: false,
        });
        if (stoppedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        postCameraDiagnostic("camera_stream_started", {
          videoWidth: videoRef.current.videoWidth,
          videoHeight: videoRef.current.videoHeight,
        });

        intervalRef.current = window.setInterval(async () => {
          try {
            const extracted = await extractor(videoRef.current, {
              sessionId,
              taskKey,
              chapterId,
              levelId,
            });
            if (!hasCameraDerivedData(extracted)) return;

            const payload = buildCameraFramePayload({
              sessionId,
              taskKey,
              chapterId,
              levelId,
              extracted,
            });

            fetch("/api/camera", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }).catch(() => {});
          } catch (error) {
            handleCameraError(error, "camera_extractor_error");
          }
        }, captureEveryMs);
      } catch (error) {
        handleCameraError(error, "camera_start_error");
      }
    }

    void startCamera();

    return () => {
      stoppedRef.current = true;
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [
    active,
    captureEveryMs,
    chapterId,
    extractor,
    levelId,
    onError,
    sessionId,
    taskKey,
  ]);

  return (
    <video
      ref={videoRef}
      className="hidden"
      muted
      playsInline
      aria-hidden="true"
    />
  );
}
