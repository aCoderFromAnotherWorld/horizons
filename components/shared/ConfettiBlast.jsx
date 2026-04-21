"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const COLORS = ["#22c55e", "#3b82f6", "#facc15", "#ec4899", "#8b5cf6"];

export default function ConfettiBlast() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setActive(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {Array.from({ length: 48 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-3 w-2 rounded-sm"
          style={{
            left: `${(index * 37) % 100}%`,
            top: "-24px",
            backgroundColor: COLORS[index % COLORS.length],
          }}
          initial={{ y: -40, rotate: 0, opacity: 1 }}
          animate={{
            y: "110vh",
            rotate: index % 2 ? 360 : -360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2.4 + (index % 8) * 0.12,
            delay: (index % 12) * 0.04,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
