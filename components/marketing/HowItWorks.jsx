'use client';

import { motion } from 'framer-motion';

const STEPS = [
  {
    emoji: '🎮',
    title: 'Play',
    description:
      'Child completes engaging emoji-based games across 6 chapters, each targeting a different aspect of development. No timers, no pressure — just play.',
    color: '#6366f1',
    bg: '#eef2ff',
  },
  {
    emoji: '📊',
    title: 'Assess',
    description:
      'Behavioral patterns are silently analyzed across 4 clinical domains: Social Communication, Restricted/Repetitive Behaviors, Pretend Play, and Sensory Processing.',
    color: '#10b981',
    bg: '#ecfdf5',
  },
  {
    emoji: '📋',
    title: 'Report',
    description:
      "Caregiver receives a friendly, plain-language screening summary with domain-level insights and recommended next steps. Always consult a qualified professional.",
    color: '#f59e0b',
    bg: '#fffbeb',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">How it works</h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
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
              {/* Connector arrow between cards (desktop) */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center text-2xl text-slate-300 font-bold select-none"
                  aria-hidden="true"
                >
                  →
                </div>
              )}

              <div
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center h-full flex flex-col"
                style={{ borderTop: `4px solid ${step.color}` }}
              >
                {/* Step number badge */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold text-white mx-auto mb-4"
                  style={{ backgroundColor: step.color }}
                >
                  {i + 1}
                </div>

                <div
                  className="text-6xl mb-4 rounded-2xl py-3"
                  style={{ backgroundColor: step.bg }}
                >
                  {step.emoji}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed flex-1">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm text-sm text-slate-600">
            <span>🔒</span>
            <span>No personal identifiers stored — Session ID is the only key</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
