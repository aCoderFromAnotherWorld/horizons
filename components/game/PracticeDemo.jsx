'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BigButton from '@/components/shared/BigButton.jsx';

const STEP_LABELS = ['Watch me! 👀', 'Try together! 🤝', 'Your turn! ⭐'];

/**
 * Animated 3-step practice demo shown before a new mechanic type.
 * Props:
 *   steps      — array of { emoji: string, label: string }
 *   onComplete — callback when the child confirms understanding
 */
export default function PracticeDemo({ steps = [], onComplete }) {
  const [activeStep, setActiveStep] = useState(0);
  const [done, setDone] = useState(false);

  const isLastStep = activeStep === Math.min(steps.length, 3) - 1;

  function advance() {
    if (isLastStep) {
      setDone(true);
      return;
    }
    setActiveStep((s) => s + 1);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 text-center">
      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white drop-shadow"
      >
        Let&apos;s practice first! 🌟
      </motion.p>

      {/* Step indicators */}
      <div className="flex gap-3">
        {STEP_LABELS.slice(0, Math.min(steps.length, 3)).map((label, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
              style={{
                backgroundColor: i < activeStep
                  ? 'rgba(255,255,255,0.9)'
                  : i === activeStep
                  ? 'rgba(255,255,255,1)'
                  : 'rgba(255,255,255,0.25)',
                color: i <= activeStep ? '#1a1a2e' : 'rgba(255,255,255,0.6)',
              }}
            >
              {i < activeStep ? '✓' : i + 1}
            </div>
            <span className="text-xs text-white/70 max-w-[60px] leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key={activeStep}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
            exit={{ scale: 0.7, opacity: 0, transition: { duration: 0.15 } }}
            className="flex flex-col items-center gap-4 bg-white/15 rounded-3xl p-8 min-w-[200px]"
          >
            <span className="text-7xl">{steps[activeStep]?.emoji ?? '🎯'}</span>
            <p className="text-lg font-semibold text-white drop-shadow max-w-xs">
              {steps[activeStep]?.label ?? ''}
            </p>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-3xl"
            >
              {STEP_LABELS[activeStep]?.split(' ').at(-1)}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-3 bg-white/20 rounded-3xl p-8"
          >
            <span className="text-6xl">🎉</span>
            <p className="text-lg font-bold text-white">Great! You&apos;re ready!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="flex gap-3">
        {!done ? (
          <BigButton onClick={advance} className="bg-white text-gray-900 hover:bg-white/90">
            {isLastStep ? 'Got it! 👍' : 'Next →'}
          </BigButton>
        ) : (
          <BigButton
            onClick={onComplete}
            className="bg-green-400 text-white hover:bg-green-300 text-xl px-8"
          >
            I understand! 👍
          </BigButton>
        )}
      </div>
    </div>
  );
}
