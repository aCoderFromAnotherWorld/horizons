'use client';

import { useEffect, useRef } from 'react';

const CANVAS_W = 1000;
const CANVAS_H = 600;
const RADIUS   = 28;

/**
 * Props:
 *   movements — array of { x, y, recorded_at } (pointer coordinates, already normalised 0-1 or raw px)
 *   width     — actual display width of the canvas element (default 100%)
 */
export default function MouseHeatmap({ movements = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    if (!movements.length) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No mouse tracking data for this session', CANVAS_W / 2, CANVAS_H / 2);
      return;
    }

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Build accumulation layer using additive blending
    for (const pt of movements) {
      // Normalise coords: if > 1, assume raw screen px on 1440×900 base
      const px = pt.x <= 1 ? pt.x * CANVAS_W : (pt.x / 1440) * CANVAS_W;
      const py = pt.y <= 1 ? pt.y * CANVAS_H : (pt.y / 900) * CANVAS_H;

      const grad = ctx.createRadialGradient(px, py, 0, px, py, RADIUS);
      grad.addColorStop(0,   'rgba(255, 80,  20, 0.08)');
      grad.addColorStop(0.4, 'rgba(255, 180,  0, 0.04)');
      grad.addColorStop(1,   'rgba(255, 255,  0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [movements]);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full h-auto block"
        aria-label="Mouse movement heatmap"
      />
    </div>
  );
}
