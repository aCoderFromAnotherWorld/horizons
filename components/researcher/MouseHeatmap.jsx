"use client";

import { useEffect, useRef } from "react";

export default function MouseHeatmap({ movements }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const styles = getComputedStyle(document.documentElement);
    ctx.fillStyle = styles.getPropertyValue("--surface-muted").trim() || "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(16, 185, 129, 0.28)";
    for (const movement of movements) {
      const x = Math.max(0, Math.min(canvas.width, (movement.x / 1280) * canvas.width));
      const y = Math.max(0, Math.min(canvas.height, (movement.y / 768) * canvas.height));
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [movements]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      className="h-auto w-full rounded-lg border bg-card"
      aria-label="Mouse movement heatmap"
    />
  );
}
