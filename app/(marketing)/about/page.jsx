import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const metadata = {
  title: 'About — Horizons',
  description: 'Research foundation, clinical domains, privacy practices, and the non-diagnostic scope of the Horizons screening tool.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-16">

      {/* Hero */}
      <div className="text-center">
        <div className="text-5xl mb-4">🧠</div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">About Horizons</h1>
        <p className="text-slate-500 text-lg leading-relaxed max-w-xl mx-auto">
          A play-based ASD screening tool for children aged 3–10, built on peer-reviewed clinical research.
        </p>
      </div>

      {/* Non-diagnostic disclaimer — prominent */}
      <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-6">
        <div className="flex gap-3">
          <div className="text-3xl leading-none shrink-0">⚠️</div>
          <div>
            <p className="font-bold text-amber-900 text-base mb-1">Important Disclaimer</p>
            <p className="text-amber-800 text-sm leading-relaxed">
              Horizons is a <strong>screening tool, not a diagnostic instrument</strong>. It cannot diagnose Autism
              Spectrum Disorder or any other condition. Results are intended to guide conversations with qualified
              healthcare professionals — not replace a comprehensive clinical evaluation. Always consult a licensed
              clinician for any developmental concerns.
            </p>
          </div>
        </div>
      </div>

      {/* Research foundation */}
      <section>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
          <span>🔬</span> Research Foundation
        </h2>
        <div className="space-y-6">
          <ResearchCard
            emoji="🔬"
            title="ADOS-2 (Maddox et al., 2017)"
            color="#8b5cf6"
          >
            <p>
              The Autism Diagnostic Observation Schedule, Second Edition (ADOS-2) is the gold-standard observational
              measure for ASD. Horizons maps directly to its two key domains:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li><strong>Social Communication (SC)</strong> — Chapters 2 and 3</li>
              <li><strong>Restricted/Repetitive Behaviors (RRB)</strong> — Chapter 4</li>
            </ul>
            <p className="mt-2">
              RRB is the critical differentiator: SC alone produces false positives. The dual-domain design
              significantly improves screening specificity.
            </p>
          </ResearchCard>

          <ResearchCard
            emoji="🎯"
            title="DTT Serious Game (Khowaja & Salim, 2018)"
            color="#f59e0b"
          >
            <p>
              This study validated play-based Discrete Trial Training in a serious game format for ASD screening.
              Two metrics inform Horizons&apos; scoring:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li><strong>Accuracy</strong> = correct_responses ÷ total_responses</li>
              <li><strong>Average attempts</strong> = sum_of_attempts ÷ total_questions</li>
            </ul>
          </ResearchCard>

          <ResearchCard
            emoji="🌌"
            title="EmoGalaxy (Irani et al., 2018)"
            color="#3b82f6"
          >
            <p>
              EmoGalaxy achieved <strong>93% screening accuracy</strong> using a Support Vector Machine classifier
              on emotion recognition game data. Key insights applied to Horizons:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Negative emotions (sadness, fear) show the greatest ASD vs. typical difference</li>
              <li>Per-game score = true_answers ÷ total_moves</li>
              <li>Cartoon/emoji faces reduce anxiety better than photorealistic faces</li>
            </ul>
          </ResearchCard>
        </div>
      </section>

      {/* Domain scoring */}
      <section>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3 flex items-center gap-2">
          <span>📊</span> How Scores Work
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Horizons uses a <strong>penalty-based scoring system</strong>: lower raw score = better outcome. 0 means no
          observable concern in that domain. Points accumulate silently during play — the child never sees a score.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'Social Communication', weight: '40%', chapters: 'Ch. 2 + 3', emoji: '🤝', color: '#3b82f6',
              note: 'Emotion recognition, conversation, joint attention, imitation' },
            { name: 'Restricted & Repetitive', weight: '30%', chapters: 'Ch. 4', emoji: '🔄', color: '#10b981',
              note: 'Routine adherence, flexibility, pattern detection, special interests' },
            { name: 'Pretend Play', weight: '15%', chapters: 'Ch. 5 (L1–L2)', emoji: '🎭', color: '#8b5cf6',
              note: 'Symbolic play recognition and spontaneous pretend creation' },
            { name: 'Sensory Processing', weight: '15%', chapters: 'Ch. 5 (L3)', emoji: '🎵', color: '#f59e0b',
              note: 'Auditory and tactile/visual sensitivity responses' },
          ].map((d) => (
            <div key={d.name} className="border border-slate-200 rounded-2xl p-4 bg-white">
              <div className="flex items-start gap-3">
                <div className="text-3xl shrink-0">{d.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-sm text-gray-900 leading-tight">{d.name}</p>
                    <span className="text-lg font-extrabold shrink-0" style={{ color: d.color }}>{d.weight}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{d.chapters}</p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{d.note}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-4 leading-relaxed">
          Red flags detected during play (e.g., no pretend play recognition, extreme sensory distress) apply a
          multiplicative penalty up to 2.0×, consistent with clinical severity weighting in ADOS-2.
        </p>
      </section>

      {/* Privacy */}
      <section>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3 flex items-center gap-2">
          <span>🔒</span> Privacy & Data Handling
        </h2>
        <div className="space-y-3">
          {[
            { emoji: '🪪', label: 'No permanent identifiers', text: "The child's name is a display label only — never stored as an identifier. Session ID (UUID) is the sole data key." },
            { emoji: '🗑️', label: 'Deletion', text: 'Researchers can delete any session and all associated data via the dashboard.' },
            { emoji: '🚫', label: 'No advertising or tracking', text: 'No third-party analytics, no data selling, no behavioral advertising — ever.' },
            { emoji: '📦', label: 'Data export', text: 'Authorized researchers can export session data as CSV or JSON for academic analysis.' },
          ].map(({ emoji, label, text }) => (
            <div key={label} className="flex gap-3 bg-slate-50 rounded-xl p-4">
              <div className="text-2xl shrink-0">{emoji}</div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{label}</p>
                <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3 flex items-center gap-2">
          <span>🏛️</span> Team & Institution
        </h2>
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <p className="text-slate-600 leading-relaxed mb-3">
            Horizons is an academic research project developed by a multidisciplinary team of software engineers,
            clinical psychologists, and child development researchers.
          </p>
          <p className="text-slate-600 leading-relaxed">
            For questions, collaboration inquiries, or to request access to researcher credentials, please use the{' '}
            <Link href="/contact" className="text-indigo-600 font-semibold hover:underline">Contact</Link> form.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <div className="text-center pt-4">
        <Link
          href="/game/start"
          className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-base px-8 py-4 hover:bg-indigo-700 transition-colors min-h-[56px] shadow-lg"
        >
          Start Assessment 🚀
        </Link>
        <p className="text-xs text-slate-400 mt-4">
          ⚠️ Screening tool only. Always consult a qualified professional.
        </p>
      </div>
    </div>
  );
}

function ResearchCard({ emoji, title, color, children }) {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: `3px solid ${color}`, backgroundColor: `${color}12` }}>
        <span className="text-3xl">{emoji}</span>
        <h3 className="font-bold text-base text-gray-900">{title}</h3>
      </div>
      <div className="px-5 py-4 text-sm text-slate-600 leading-relaxed space-y-1">{children}</div>
    </div>
  );
}
