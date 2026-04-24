'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const EMOJI_ITEMS = [
  { emoji: '🧒', x: '8%',  y: '12%', delay: 0.10, size: 68 },
  { emoji: '🎮', x: '82%', y: '8%',  delay: 0.20, size: 54 },
  { emoji: '🧩', x: '86%', y: '62%', delay: 0.30, size: 58 },
  { emoji: '🎨', x: '4%',  y: '68%', delay: 0.25, size: 50 },
  { emoji: '🌈', x: '44%', y: '82%', delay: 0.40, size: 54 },
  { emoji: '⭐', x: '28%', y: '6%',  delay: 0.15, size: 38 },
  { emoji: '🌟', x: '68%', y: '78%', delay: 0.45, size: 36 },
  { emoji: '🎯', x: '72%', y: '28%', delay: 0.35, size: 40 },
];

export default function Hero() {
  function scrollToHowItWorks() {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section
      className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden px-4 py-20"
      style={{
        background:
          'radial-gradient(ellipse at 25% 20%, #c4b5fd 0%, #818cf8 25%, #4f46e5 55%, #312e81 80%, #1e1b4b 100%)',
      }}
    >
      {/* Floating emoji collage */}
      {EMOJI_ITEMS.map(({ emoji, x, y, delay, size }) => (
        <motion.div
          key={`${emoji}-${x}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.75 }}
          transition={{ delay, type: 'spring', stiffness: 280, damping: 18 }}
          className="absolute select-none pointer-events-none"
          style={{ left: x, top: y }}
        >
          <motion.span
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 3.5 + delay * 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: delay,
            }}
            style={{ fontSize: size, display: 'block', lineHeight: 1 }}
          >
            {emoji}
          </motion.span>
        </motion.div>
      ))}

      {/* Frosted glass card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
        className="relative z-10 text-center max-w-2xl bg-white/10 backdrop-blur-sm rounded-3xl px-8 py-12 border border-white/20 shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-6xl mb-4 leading-none"
        >
          🧠
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.55 }}
          className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-white drop-shadow-lg tracking-tight mb-4 leading-none"
        >
          Horizons
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.5 }}
          className="text-lg sm:text-xl text-white/85 font-medium max-w-lg mx-auto leading-relaxed mb-8"
        >
          Understanding your child through play — a research-based behavioral screening tool for children aged 3–10
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52, duration: 0.45 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            asChild
            size="lg"
            className="rounded-2xl bg-white text-indigo-900 hover:bg-white/90 font-bold text-base px-7 py-5 shadow-xl min-h-[56px]"
          >
            <Link href="/game/start">Start Assessment 🚀</Link>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={scrollToHowItWorks}
            className="rounded-2xl border border-white/30 text-white hover:bg-white/15 bg-white/8 font-semibold text-base px-7 py-5 min-h-[56px]"
          >
            Learn More ↓
          </Button>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-6 mt-8 pt-6 border-t border-white/20"
        >
          {[
            { emoji: '📚', label: '3 research studies' },
            { emoji: '🎮', label: '6 chapters' },
            { emoji: '📊', label: '4 clinical domains' },
            { emoji: '⏱️', label: '60–75 minutes' },
          ].map(({ emoji, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-white/75 text-sm font-medium">
              <span>{emoji}</span>
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
