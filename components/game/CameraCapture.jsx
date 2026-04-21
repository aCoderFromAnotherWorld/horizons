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

  useEffect(() => {
    if (!active || !sessionId || !taskKey) return undefined;
    if (!navigator?.mediaDevices?.getUserMedia) {
      onError?.(new Error("Camera is not available in this browser"));
      return undefined;
    }
    stoppedRef.current = false;

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
            onError?.(error);
          }
        }, captureEveryMs);
      } catch (error) {
        onError?.(error);
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
