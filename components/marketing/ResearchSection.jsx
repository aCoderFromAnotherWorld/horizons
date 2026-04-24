'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const CITATIONS = [
  {
    color: '#8b5cf6',
    bg: '#f5f3ff',
    emoji: '🔬',
    title: 'ADOS-2 Foundation',
    authors: 'Maddox et al., 2017',
    description:
      'Gold-standard ASD observational measure. Horizons maps directly to its two key domains: Social Communication and Restricted/Repetitive Behaviors — the critical differentiator that reduces false positives.',
  },
  {
    color: '#f59e0b',
    bg: '#fffbeb',
    emoji: '🎯',
    title: 'DTT Serious Game',
    authors: 'Khowaja & Salim, 2018',
    description:
      'Discrete Trial Training in serious game format. Validated accuracy metric: correct_responses ÷ total_responses. Horizons uses this per-task scoring across all interactive levels.',
  },
  {
    color: '#3b82f6',
    bg: '#eff6ff',
    emoji: '🌌',
    title: 'EmoGalaxy Study',
    authors: 'Irani et al., 2018',
    description:
      "93% screening accuracy via SVM classifier. Key finding: negative emotions (sadness, fear) show greater ASD vs. typical difference — informing Horizons' Chapter 2 emotion recognition design.",
    highlight: '93% screening accuracy',
  },
];

const DOMAINS = [
  { name: 'Social Communication', weight: '40%', chapters: 'Ch. 2 + 3', emoji: '🤝', color: '#3b82f6' },
  { name: 'Restricted & Repetitive', weight: '30%', chapters: 'Ch. 4', emoji: '🔄', color: '#10b981' },
  { name: 'Pretend Play', weight: '15%', chapters: 'Ch. 5 (L1–L2)', emoji: '🎭', color: '#8b5cf6' },
  { name: 'Sensory Processing', weight: '15%', chapters: 'Ch. 5 (L3)', emoji: '🎵', color: '#f59e0b' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function ResearchSection() {
  return (
    <section id="research" className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Citation cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Research Foundation</h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            Built on peer-reviewed clinical research, not guesswork
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {CITATIONS.map((c) => (
            <motion.div key={c.title} variants={item}>
              <Card className="h-full overflow-hidden border-0 shadow-md" style={{ borderTop: `4px solid ${c.color}` }}>
                <CardHeader className="pb-3" style={{ backgroundColor: c.bg }}>
                  <div className="text-4xl mb-2 leading-none">{c.emoji}</div>
                  <CardTitle className="text-base leading-tight">{c.title}</CardTitle>
                  <CardDescription className="text-xs font-medium">{c.authors}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-5">
                  <p className="text-sm text-slate-600 leading-relaxed">{c.description}</p>
                  {c.highlight && (
                    <div
                      className="mt-4 inline-block px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.highlight}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Domain overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          <h3 className="text-2xl font-extrabold text-gray-900 mb-2">4 Clinical Domains</h3>
          <p className="text-slate-500 text-base">Each chapter contributes to one or more domain scores</p>
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
                className="rounded-2xl p-5 text-center border-2 h-full flex flex-col items-center"
                style={{ borderColor: `${d.color}50`, backgroundColor: `${d.color}10` }}
              >
                <div className="text-4xl mb-2 leading-none">{d.emoji}</div>
                <div className="text-xs font-bold text-gray-900 leading-tight mb-2">{d.name}</div>
                <div className="text-2xl font-extrabold mb-1" style={{ color: d.color }}>
                  {d.weight}
                </div>
                <div className="text-xs text-slate-500">{d.chapters}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
