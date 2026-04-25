'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSettingsStore } from '@/store/settingsStore.js';
import SensoryToggle from '@/components/shared/SensoryToggle.jsx';
import EmojiAvatar, { SKIN_SWATCHES, HAIR_COLORS, OUTFIT_COLORS } from '@/components/game/EmojiAvatar.jsx';

const GUIDES = [
  { emoji: '🦊', label: 'Fox' },
  { emoji: '🐻', label: 'Bear' },
  { emoji: '🦁', label: 'Lion' },
  { emoji: '🐸', label: 'Frog' },
];
const AGES = [3, 4, 5, 6, 7, 8, 9, 10];
const TOTAL_STEPS = 4;

export default function StartPage() {
  const router = useRouter();
  const setSession    = useGameStore((s) => s.setSession);
  const resetGame     = useGameStore((s) => s.reset);
  const setGuideEmoji = useSettingsStore((s) => s.setGuideEmoji);
  const setSensory    = useSettingsStore((s) => s.setSensoryLevel);
  const sensoryLevel  = useSettingsStore((s) => s.sensoryLevel);

  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  // Step 1
  const [name, setName]   = useState('');
  const [age, setAge]     = useState(null);

  // Step 2
  const [guide, setGuide] = useState('🦊');

  // Step 3 — sensory level is already in store

  // Step 4
  const [skinTone, setSkinTone]     = useState(0);
  const [hairColor, setHairColor]   = useState(HAIR_COLORS[0]);
  const [outfitColor, setOutfitColor] = useState(OUTFIT_COLORS[0]);

  function canAdvance() {
    if (step === 1) return age !== null;
    return true;
  }

  function advance() {
    if (!canAdvance()) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    }
  }

  function back() {
    if (step > 1) setStep((s) => s - 1);
  }

  async function handleStart() {
    if (!age) return;
    setLoading(true);
    setError('');
    try {
      const avatarData = { skinTone, hairColor, outfitColor };
      const res = await fetch('/api/game/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerAge: age,
          playerName: name.trim() || null,
          guideChoice: guide,
          sensoryLevel,
          avatarData,
        }),
      });
      if (!res.ok) throw new Error('Failed to create session');
      const { sessionId } = await res.json();

      resetGame();
      setSession({ sessionId, playerAge: age, playerName: name.trim() || null });
      setGuideEmoji(guide);
      setSensory(sensoryLevel);

      router.push('/game/map');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            className="w-2.5 h-2.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: s <= step ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)',
              transform: s === step ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepCard key="step1">
            <h1 className="text-2xl font-bold text-white text-center mb-2">Hello! 👋</h1>
            <p className="text-white/80 text-center mb-6 text-sm">Let&apos;s get ready to play!</p>

            {/* Name input */}
            <div className="w-full mb-5">
              <label className="block text-white/80 text-sm font-medium mb-1.5">
                What&apos;s your name? <span className="text-white/50">(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type your name…"
                maxLength={40}
                className="w-full rounded-2xl bg-white/20 border border-white/30 text-white placeholder:text-white/50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-white/60"
              />
            </div>

            {/* Age selector */}
            <div className="w-full">
              <label className="block text-white/80 text-sm font-medium mb-2">
                How old are you? <span className="text-red-300">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AGES.map((a) => (
                  <motion.button
                    key={a}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setAge(a)}
                    aria-label={`Age ${a}`}
                    aria-pressed={age === a}
                    className="min-h-[64px] rounded-2xl text-xl font-bold transition-all select-none"
                    style={{
                      backgroundColor: age === a ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)',
                      color: age === a ? '#1a1a2e' : '#ffffff',
                      border: age === a ? '2px solid white' : '2px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    {a}
                  </motion.button>
                ))}
              </div>
            </div>
          </StepCard>
        )}

        {step === 2 && (
          <StepCard key="step2">
            <h2 className="text-2xl font-bold text-white text-center mb-1">Pick your guide! 🌟</h2>
            <p className="text-white/70 text-center text-sm mb-6">Who will help you on your adventure?</p>
            <div className="grid grid-cols-2 gap-4 w-full">
              {GUIDES.map(({ emoji, label }) => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setGuide(emoji)}
                  aria-label={`${label} guide`}
                  aria-pressed={guide === emoji}
                  className="flex flex-col items-center justify-center gap-2 min-h-[100px] rounded-3xl transition-all select-none"
                  style={{
                    backgroundColor: guide === emoji ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)',
                    border: guide === emoji ? '3px solid white' : '3px solid rgba(255,255,255,0.3)',
                    color: guide === emoji ? '#1a1a2e' : '#ffffff',
                    boxShadow: guide === emoji ? '0 4px 24px rgba(0,0,0,0.25)' : 'none',
                  }}
                >
                  <motion.span
                    animate={guide === emoji ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.4 }}
                    className="text-5xl leading-none"
                  >
                    {emoji}
                  </motion.span>
                  <span className="font-bold text-base">{label}</span>
                </motion.button>
              ))}
            </div>
          </StepCard>
        )}

        {step === 3 && (
          <StepCard key="step3">
            <h2 className="text-2xl font-bold text-white text-center mb-1">Sounds & Animation</h2>
            <p className="text-white/70 text-center text-sm mb-2">
              You can make sounds softer and animations calmer.
            </p>
            <p className="text-white/60 text-center text-xs mb-6">
              Caregivers can change this any time during the game.
            </p>
            <div className="flex flex-col items-center gap-5 w-full">
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-4 text-4xl">
                  <span>🔇</span>
                  <span>→</span>
                  <span>🔊</span>
                </div>
                <SensoryToggle />
              </div>
              <div className="bg-white/10 rounded-2xl p-4 text-sm text-white/75 max-w-xs text-center leading-relaxed">
                {sensoryLevel === 'low' && '🤫 Quiet & calm — soft sounds, simple animations'}
                {sensoryLevel === 'medium' && '😊 Balanced — cheerful sounds, gentle animations'}
                {sensoryLevel === 'high' && '🎉 Full experience — vibrant sounds and animations'}
              </div>
            </div>
          </StepCard>
        )}

        {step === 4 && (
          <StepCard key="step4">
            <h2 className="text-2xl font-bold text-white text-center mb-1">Make your character! 🎨</h2>
            <p className="text-white/70 text-center text-sm mb-4">Choose how you look!</p>

            {/* Avatar preview */}
            <div className="flex justify-center mb-5">
              <div className="bg-white/20 rounded-3xl p-5">
                <EmojiAvatar skinTone={skinTone} hairColor={hairColor} outfitColor={outfitColor} size={100} />
              </div>
            </div>

            {/* Skin tone */}
            <div className="w-full mb-4">
              <p className="text-white/80 text-xs font-semibold mb-2 text-center">Skin tone</p>
              <div className="flex justify-center gap-3">
                {SKIN_SWATCHES.map((color, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setSkinTone(i)}
                    className="w-10 h-10 rounded-full border-4 transition-all select-none"
                    style={{
                      backgroundColor: color,
                      borderColor: skinTone === i ? 'white' : 'transparent',
                      boxShadow: skinTone === i ? '0 0 0 2px rgba(255,255,255,0.5)' : 'none',
                    }}
                    aria-label={`Skin tone ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Hair color */}
            <div className="w-full mb-4">
              <p className="text-white/80 text-xs font-semibold mb-2 text-center">Hair color</p>
              <div className="flex justify-center gap-3">
                {HAIR_COLORS.map((color) => (
                  <motion.button
                    key={color}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setHairColor(color)}
                    className="w-10 h-10 rounded-full border-4 transition-all select-none"
                    style={{
                      backgroundColor: color,
                      borderColor: hairColor === color ? 'white' : 'transparent',
                      boxShadow: hairColor === color ? '0 0 0 2px rgba(255,255,255,0.5)' : 'none',
                    }}
                    aria-label={`Hair color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Outfit color */}
            <div className="w-full mb-2">
              <p className="text-white/80 text-xs font-semibold mb-2 text-center">Outfit color</p>
              <div className="flex justify-center gap-3">
                {OUTFIT_COLORS.map((color) => (
                  <motion.button
                    key={color}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setOutfitColor(color)}
                    className="w-10 h-10 rounded-full border-4 transition-all select-none"
                    style={{
                      backgroundColor: color,
                      borderColor: outfitColor === color ? 'white' : 'transparent',
                      boxShadow: outfitColor === color ? '0 0 0 2px rgba(255,255,255,0.5)' : 'none',
                    }}
                    aria-label={`Outfit color ${color}`}
                  />
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-300 text-sm text-center mt-2">{error}</p>
            )}
          </StepCard>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-6 w-full max-w-sm">
        {step > 1 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={back}
            className="flex-1 min-h-[56px] rounded-2xl bg-white/15 text-white font-semibold text-base border border-white/30 select-none"
          >
            ← Back
          </motion.button>
        )}
        {step < TOTAL_STEPS ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={advance}
            disabled={!canAdvance()}
            className="flex-1 min-h-[56px] rounded-2xl font-bold text-base select-none transition-opacity"
            style={{
              backgroundColor: canAdvance() ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)',
              color: canAdvance() ? '#1a1a2e' : 'rgba(255,255,255,0.5)',
            }}
          >
            Next →
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            disabled={loading || !age}
            className="flex-1 min-h-[64px] rounded-2xl font-bold text-lg select-none"
            style={{
              backgroundColor: loading || !age ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.95)',
              color: loading || !age ? 'rgba(255,255,255,0.5)' : '#1a1a2e',
            }}
          >
            {loading ? '⏳ Starting…' : "Let's Go! 🚀"}
          </motion.button>
        )}
      </div>
    </div>
  );
}

function StepCard({ children }) {
  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 26 } }}
      exit={{ x: -40, opacity: 0, transition: { duration: 0.18 } }}
      className="w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-xl flex flex-col items-center"
    >
      {children}
    </motion.div>
  );
}
