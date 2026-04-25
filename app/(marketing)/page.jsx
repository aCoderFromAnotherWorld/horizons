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
    <section className="py-16 px-4" style={{ background: '#1c2c6e' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold mb-2 text-white">Privacy First 🔒</h2>
          <p className="text-base max-w-md mx-auto" style={{ color: 'rgba(200,215,255,0.85)' }}>
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
              className="rounded-2xl p-5 transition-colors"
              style={{
                background: 'rgba(255,255,255,0.09)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <div className="text-3xl mb-3">{emoji}</div>
              <div className="font-bold text-sm mb-1 text-white">{title}</div>
              <div className="text-xs leading-relaxed" style={{ color: 'rgba(200,215,255,0.88)' }}>{desc}</div>
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
        <div className="text-5xl mb-5">🚀</div>
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight" style={{ color: '#0F172A' }}>
          Ready to begin?
        </h2>
        <p className="text-lg mb-8 leading-relaxed" style={{ color: '#57534E' }}>
          The assessment takes 60–75 minutes. Find a quiet, comfortable place and let your child lead the way.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/game/start"
            className="inline-flex items-center justify-center rounded-2xl text-white font-bold text-base px-8 py-4 min-h-[56px] transition-opacity hover:opacity-90"
            style={{ background: '#2f4abf', boxShadow: '0 4px 16px rgba(47,74,191,0.35)' }}
          >
            Start Assessment 🚀
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-2xl font-semibold text-base px-8 py-4 min-h-[56px] transition-colors hover:bg-[#F5F3F0]"
            style={{ border: '1px solid #D6D3D1', color: '#44403C' }}
          >
            Read the research
          </Link>
        </div>
        <p className="text-xs mt-6" style={{ color: '#A8A29E' }}>
          ⚠️ This is a screening tool, not a clinical diagnosis. Always consult a qualified professional.
        </p>
      </div>
    </section>
  );
}
