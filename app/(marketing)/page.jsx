import Link from 'next/link';
import Hero from '@/components/marketing/Hero.jsx';
import HowItWorks from '@/components/marketing/HowItWorks.jsx';
import ResearchSection from '@/components/marketing/ResearchSection.jsx';

export const metadata = {
  title: 'Horizons — Play-Based ASD Screening',
  description:
    'Research-based behavioral screening tool for children aged 3–10. Engaging emoji games across 6 chapters analyze social communication, repetitive behaviors, pretend play, and sensory processing.',
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ResearchSection />
      <PrivacySection />
      <CtaSection />
    </>
  );
}

function PrivacySection() {
  return (
    <section className="py-16 px-4 bg-slate-900 text-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold mb-2">Privacy First 🔒</h2>
          <p className="text-slate-400 text-base max-w-md mx-auto">
            Designed with child privacy as a non-negotiable requirement
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { emoji: '🪪', title: 'No permanent IDs', desc: "Child's name is a display label only — never stored as an identifier" },
            { emoji: '🔑', title: 'Session-based', desc: 'Session ID is the only data key; nothing links to a real-world identity' },
            { emoji: '🚫', title: 'No tracking', desc: 'No advertising, no third-party analytics, no data selling — ever' },
            { emoji: '🏥', title: 'Screening only', desc: 'Non-diagnostic tool; results guide professional consultation, not replace it' },
          ].map(({ emoji, title, desc }) => (
            <div
              key={title}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors"
            >
              <div className="text-3xl mb-3">{emoji}</div>
              <div className="font-bold text-sm mb-1">{title}</div>
              <div className="text-slate-400 text-xs leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-20 px-4 bg-white text-center">
      <div className="max-w-xl mx-auto">
        <div className="text-5xl mb-4">🚀</div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
          Ready to begin?
        </h2>
        <p className="text-slate-500 text-lg mb-8 leading-relaxed">
          The assessment takes 60–75 minutes. Find a quiet, comfortable place and let your child lead the way.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/game/start"
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-base px-8 py-4 hover:bg-indigo-700 transition-colors min-h-[56px] shadow-lg"
          >
            Start Assessment 🚀
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 text-slate-700 font-semibold text-base px-8 py-4 hover:bg-slate-50 transition-colors min-h-[56px]"
          >
            Read the research
          </Link>
        </div>
        <p className="text-xs text-slate-400 mt-6">
          ⚠️ This is a screening tool, not a clinical diagnosis. Always consult a qualified professional.
        </p>
      </div>
    </section>
  );
}
