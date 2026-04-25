'use client';

import { motion } from 'framer-motion';

const STEPS = [
  {
    emoji: '🎮',
    title: 'Play',
    description:
      'Child completes engaging emoji-based games across 6 chapters, each targeting a different aspect of development. No timers, no pressure — just play.',
    color: '#2f4abf',
    bg: '#EEF3FF',
    border: '#B8C8F8',
  },
  {
    emoji: '📊',
    title: 'Assess',
    description:
      'Behavioral patterns are analyzed across 4 clinical domains: Social Communication, Restricted/Repetitive Behaviors, Pretend Play, and Sensory Processing.',
    color: '#065F46',
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
  {
    emoji: '📋',
    title: 'Report',
    description:
      "Caregiver receives a friendly, plain-language screening summary with domain-level insights and recommended next steps. Always consult a qualified professional.",
    color: '#B45309',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: 'easeOut' } },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background: '#F7F5F2' }} className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: '#0F172A' }}>
            How it works
          </h2>
          <p className="text-lg max-w-md mx-auto" style={{ color: '#57534E' }}>
            A 60–75 minute play session that reveals meaningful patterns
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {STEPS.map((step, i) => (
            <motion.div key={step.title} variants={cardVariant} className="relative">
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center text-xl select-none font-bold"
                  aria-hidden="true"
                  style={{ color: '#94A3B8' }}
                >
                  →
                </div>
              )}

              <div
                className="bg-white rounded-2xl p-8 h-full flex flex-col"
                style={{
                  borderTop: `3px solid ${step.color}`,
                  border: `1px solid ${step.border}`,
                  borderTopColor: step.color,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold text-white mx-auto mb-5"
                  style={{ background: step.color }}
                >
                  {i + 1}
                </div>
                <div
                  className="text-5xl mb-4 rounded-xl py-3 text-center"
                  style={{ background: step.bg }}
                >
                  {step.emoji}
                </div>
                <h3 className="text-lg font-bold mb-2 text-center" style={{ color: '#0F172A' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed flex-1 text-center" style={{ color: '#57534E' }}>
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <div
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium"
            style={{ background: '#FFFFFF', border: '1px solid #D6D3D1', color: '#44403C' }}
          >
            <span>🔒</span>
            <span>No personal identifiers stored — Session ID is the only key</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
