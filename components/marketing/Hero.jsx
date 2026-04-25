'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const EMOJI_ITEMS = [
  { emoji: '🧒', x: '7%',  y: '14%', delay: 0.10, size: 64 },
  { emoji: '🎮', x: '80%', y: '9%',  delay: 0.20, size: 52 },
  { emoji: '🧩', x: '84%', y: '60%', delay: 0.30, size: 56 },
  { emoji: '🎨', x: '4%',  y: '66%', delay: 0.25, size: 48 },
  { emoji: '🌈', x: '43%', y: '80%', delay: 0.40, size: 52 },
  { emoji: '⭐', x: '27%', y: '7%',  delay: 0.15, size: 36 },
  { emoji: '🌟', x: '66%', y: '76%', delay: 0.45, size: 34 },
  { emoji: '🎯', x: '70%', y: '26%', delay: 0.35, size: 38 },
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
          'linear-gradient(155deg, #1a2560 0%, #243296 30%, #2f4abf 58%, #4063d0 80%, #5a7ad8 100%)',
      }}
    >
      {/* Subtle warm glow for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(99,130,225,0.18) 0%, transparent 68%)',
        }}
      />

      {/* Floating emoji — hidden on mobile to avoid overlapping the centred card */}
      {EMOJI_ITEMS.map(({ emoji, x, y, delay, size }) => (
        <motion.div
          key={`${emoji}-${x}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.65 }}
          transition={{ delay, type: 'spring', stiffness: 260, damping: 20 }}
          className="hidden sm:block absolute select-none pointer-events-none"
          style={{ left: x, top: y }}
        >
          <motion.span
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4 + delay * 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: delay * 1.5,
            }}
            style={{ fontSize: size, display: 'block', lineHeight: 1 }}
          >
            {emoji}
          </motion.span>
        </motion.div>
      ))}

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut', delay: 0.05 }}
        className="relative z-10 text-center max-w-2xl w-full"
        style={{
          background: 'rgba(255,255,255,0.09)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: '1.75rem',
          padding: '3rem 2rem',
          boxShadow: '0 20px 60px rgba(10,20,70,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          className="text-6xl mb-4 leading-none"
        >
          🧠
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.55 }}
          className="font-extrabold text-white tracking-tight mb-3 leading-none"
          style={{ fontSize: 'clamp(3rem, 10vw, 5rem)' }}
        >
          Horizons
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.5 }}
          className="text-base sm:text-lg font-medium max-w-md mx-auto leading-relaxed mb-8"
          style={{ color: 'rgba(220,230,255,0.92)' }}
        >
          Understanding your child through play — a research-based behavioral
          screening tool for children aged 3–10
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.50, duration: 0.45 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            asChild
            size="lg"
            className="rounded-2xl font-bold text-base px-7 min-h-[54px]"
            style={{
              background: '#FFFFFF',
              color: '#1e2f8c',
              boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
            }}
          >
            <Link href="/game/start">Start Assessment 🚀</Link>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={scrollToHowItWorks}
            className="rounded-2xl font-semibold text-base px-7 min-h-[54px]"
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: '#dce8ff',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            Learn More ↓
          </Button>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.68, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-5 mt-8 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.18)' }}
        >
          {[
            { emoji: '📚', label: '3 research studies' },
            { emoji: '🎮', label: '6 chapters' },
            { emoji: '📊', label: '4 clinical domains' },
            { emoji: '⏱️', label: '60–75 minutes' },
          ].map(({ emoji, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: 'rgba(210,225,255,0.92)' }}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
