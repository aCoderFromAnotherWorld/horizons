'use client';

import { useEffect, useRef } from 'react';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f472b6', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6'];
const PARTICLE_COUNT = 80;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

/**
 * Full-viewport canvas confetti blast that plays once on mount.
 * Renders colored rectangles — no image assets.
 */
export default function ConfettiBlast({ onDone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: randomBetween(canvas.width * 0.2, canvas.width * 0.8),
      y: randomBetween(canvas.height * 0.3, canvas.height * 0.6),
      vx: randomBetween(-6, 6),
      vy: randomBetween(-14, -4),
      w: randomBetween(8, 18),
      h: randomBetween(6, 12),
      angle: randomBetween(0, Math.PI * 2),
      spin: randomBetween(-0.2, 0.2),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 1,
    }));

    let raf;
    let frame = 0;
    const TOTAL_FRAMES = 90;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // gravity
        p.angle += p.spin;
        p.alpha = Math.max(0, 1 - frame / TOTAL_FRAMES);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (frame < TOTAL_FRAMES) {
        raf = requestAnimationFrame(draw);
      } else {
        onDone?.();
      }
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  );
}
