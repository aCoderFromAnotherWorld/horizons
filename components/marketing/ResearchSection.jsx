'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const CITATIONS = [
  {
    color: '#5B21B6',
    bg: '#FAF5FF',
    border: '#DDD6FE',
    emoji: '🔬',
    title: 'ADOS-2 Foundation',
    authors: 'Maddox et al., 2017',
    description:
      'Gold-standard ASD observational measure. Horizons maps directly to its two key domains: Social Communication and Restricted/Repetitive Behaviors — the critical differentiator that reduces false positives.',
  },
  {
    color: '#B45309',
    bg: '#FFFBEB',
    border: '#FDE68A',
    emoji: '🎯',
    title: 'DTT Serious Game',
    authors: 'Khowaja & Salim, 2018',
    description:
      'Discrete Trial Training in serious game format. Validated accuracy metric: correct_responses ÷ total_responses. Horizons uses this per-task scoring across all interactive levels.',
  },
  {
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    emoji: '🌌',
    title: 'EmoGalaxy Study',
    authors: 'Irani et al., 2018',
    description:
      "93% screening accuracy via SVM classifier. Key finding: negative emotions (sadness, fear) show greater ASD vs. typical difference — informing Horizons' Chapter 2 emotion recognition design.",
    highlight: '93% screening accuracy',
  },
];

const DOMAINS = [
  { name: 'Social Communication', weight: '40%', chapters: 'Ch. 2 + 3', emoji: '🤝', color: '#1D4ED8', bg: '#EFF6FF' },
  { name: 'Restricted & Repetitive', weight: '30%', chapters: 'Ch. 4', emoji: '🔄', color: '#065F46', bg: '#ECFDF5' },
  { name: 'Pretend Play', weight: '15%', chapters: 'Ch. 5 (L1–L2)', emoji: '🎭', color: '#5B21B6', bg: '#FAF5FF' },
  { name: 'Sensory Processing', weight: '15%', chapters: 'Ch. 5 (L3)', emoji: '🎵', color: '#B45309', bg: '#FFFBEB' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.44, ease: 'easeOut' } },
};

export default function ResearchSection() {
  return (
    <section id="research" className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: '#0F172A' }}>
            Research Foundation
          </h2>
          <p className="text-lg max-w-md mx-auto" style={{ color: '#57534E' }}>
            Built on peer-reviewed clinical research, not guesswork
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16"
        >
          {CITATIONS.map((c) => (
            <motion.div key={c.title} variants={item}>
              <div
                className="h-full rounded-2xl overflow-hidden"
                style={{
                  border: `1px solid ${c.border}`,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                }}
              >
                <div className="px-6 pt-6 pb-4" style={{ background: c.bg }}>
                  <div className="text-4xl mb-3 leading-none">{c.emoji}</div>
                  <h3 className="font-bold text-base leading-tight mb-1" style={{ color: '#0F172A' }}>
                    {c.title}
                  </h3>
                  <p className="text-xs font-medium" style={{ color: c.color }}>{c.authors}</p>
                </div>
                <div className="px-6 py-5 bg-white">
                  <p className="text-sm leading-relaxed" style={{ color: '#44403C' }}>{c.description}</p>
                  {c.highlight && (
                    <div
                      className="mt-4 inline-block px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: c.color }}
                    >
                      {c.highlight}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Domain overview */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          <h3 className="text-2xl font-extrabold mb-2" style={{ color: '#0F172A' }}>
            4 Clinical Domains
          </h3>
          <p className="text-base" style={{ color: '#57534E' }}>
            Each chapter contributes to one or more domain scores
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {DOMAINS.map((d) => (
            <motion.div key={d.name} variants={item}>
              <div
                className="rounded-2xl p-5 text-center h-full flex flex-col items-center"
                style={{
                  background: d.bg,
                  border: `1px solid ${d.color}30`,
                }}
              >
                <div className="text-4xl mb-2 leading-none">{d.emoji}</div>
                <div className="text-xs font-bold leading-tight mb-2" style={{ color: '#0F172A' }}>
                  {d.name}
                </div>
                <div className="text-2xl font-extrabold mb-1" style={{ color: d.color }}>
                  {d.weight}
                </div>
                <div className="text-xs" style={{ color: '#78716C' }}>{d.chapters}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
