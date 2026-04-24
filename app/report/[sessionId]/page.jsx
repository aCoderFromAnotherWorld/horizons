import { getSession } from '@/lib/db/queries/sessions.js';
import { getDomainScoresBySession } from '@/lib/db/queries/domainScores.js';
import { getRedFlagsBySession } from '@/lib/db/queries/redFlags.js';
import { verifyReportToken } from '@/lib/reportToken.js';
import PrintButton from '@/components/shared/PrintButton.jsx';

const DOMAIN_INFO = {
  social_communication: {
    emoji: '💬',
    name: 'Social Communication',
    description: 'How the child shares feelings, understands others, and connects through conversation and gesture.',
  },
  restricted_repetitive: {
    emoji: '🔄',
    name: 'Routines & Patterns',
    description: 'How the child handles changes to routine, flexibility, and repeated or focused interests.',
  },
  pretend_play: {
    emoji: '🎭',
    name: 'Pretend Play',
    description: 'How the child uses imagination and engages in symbolic or make-believe scenarios.',
  },
  sensory_processing: {
    emoji: '🌈',
    name: 'Sensory Processing',
    description: 'How the child responds to sounds, sights, textures, and other sensory experiences.',
  },
};

const RISK_DISPLAY = {
  low: {
    badge: '🟢',
    short: 'Typical Range',
    desc: 'Responses in this area were within the typical range for this age group. No immediate concerns identified.',
  },
  medium: {
    badge: '🟡',
    short: 'Some Differences Noted',
    desc: 'Some differences were observed in this area. Consider mentioning these findings to a specialist during a routine visit.',
  },
  high: {
    badge: '🟠',
    short: 'Notable Differences',
    desc: 'Noticeable differences were observed. Consulting a qualified specialist for a more detailed assessment is recommended.',
  },
  very_high: {
    badge: '🔴',
    short: 'Significant Differences',
    desc: 'Significant differences were observed in this area. Please consult a qualified specialist as soon as possible.',
  },
};

const RISK_ORDER = ['low', 'medium', 'high', 'very_high'];

const RED_FLAG_PLAIN = {
  negative_emotion_recognition_under_50:
    'Difficulty recognising worried, sad, or fearful feelings in others',
  complete_absence_pretend_play:
    'All pretend play scenarios were interpreted literally — no symbolic play observed',
  extreme_sensory_distress:
    'Multiple sounds or sensory stimuli caused significant distress',
  rigid_pattern_distress:
    'Disruptions to familiar patterns caused notable distress',
  poor_imitation_all_modalities:
    'Difficulty imitating facial expressions, gestures, and object use',
};

function ErrorPage({ message }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center gap-4">
      <span className="text-6xl">🔒</span>
      <h1 className="text-2xl font-bold text-slate-800">Report Unavailable</h1>
      <p className="text-slate-500 max-w-sm text-sm">{message}</p>
    </div>
  );
}

export default async function ReportPage({ params, searchParams }) {
  const { sessionId } = await params;
  const { token } = await searchParams;

  // Load session
  let session;
  try {
    session = await getSession(sessionId);
  } catch {
    return <ErrorPage message="Could not load session data. Please try again later." />;
  }

  if (!session) {
    return <ErrorPage message="Session not found. This report may have been removed." />;
  }

  // Verify HMAC token — constant-time comparison
  const completedAt = session.completed_at ?? session.started_at;
  if (!token || !verifyReportToken(sessionId, completedAt, token)) {
    return <ErrorPage message="This report link is invalid or has expired. Please use the link provided at the end of the game." />;
  }

  // Load domain scores and red flags in parallel
  const [domainScores, redFlags] = await Promise.all([
    getDomainScoresBySession(sessionId),
    getRedFlagsBySession(sessionId),
  ]);

  const childName = session.player_name || 'Your Child';
  const firstName = childName.split(' ')[0];
  const dateStr = new Date(completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Determine overall worst risk level
  const overallRisk = domainScores.reduce((worst, ds) => {
    const current = RISK_ORDER.indexOf(ds.risk_level ?? 'low');
    const prev    = RISK_ORDER.indexOf(worst);
    return current > prev ? (ds.risk_level ?? 'low') : worst;
  }, 'low');
  const overallDisplay = RISK_DISPLAY[overallRisk] ?? RISK_DISPLAY.low;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Report header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-slate-200">
            <div className="text-5xl mb-3 select-none">🌟</div>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-1">
              Horizons Screening Summary
            </h1>
            <p className="text-slate-500 text-sm">
              {firstName} &middot; {dateStr}
            </p>
          </div>

          {/* Overall risk indicator */}
          <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6">
            <span className="text-4xl select-none">{overallDisplay.badge}</span>
            <div>
              <p className="font-bold text-slate-800 text-lg">{overallDisplay.short}</p>
              <p className="text-slate-500 text-sm mt-0.5 leading-snug">{overallDisplay.desc}</p>
            </div>
          </div>

          {/* Domain results */}
          <h2 className="text-lg font-bold text-slate-700 mb-3">Domain Results</h2>
          <div className="flex flex-col gap-3 mb-8">
            {domainScores.map(ds => {
              const info    = DOMAIN_INFO[ds.domain] ?? { emoji: '📊', name: ds.domain, description: '' };
              const display = RISK_DISPLAY[ds.risk_level] ?? RISK_DISPLAY.low;
              return (
                <div
                  key={ds.domain}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-start gap-4"
                >
                  <span className="text-3xl shrink-0 select-none">{info.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <p className="font-bold text-slate-800">{info.name}</p>
                      <span className="text-xs font-semibold text-slate-600 shrink-0">
                        {display.badge} {display.short}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm leading-snug">{display.desc}</p>
                    <p className="text-slate-400 text-xs mt-1 leading-snug">{info.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Areas to explore (red flags) */}
          {redFlags.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-700 mb-3">Areas to Explore</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <ul className="space-y-2">
                  {redFlags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-amber-800 text-sm">
                      <span className="shrink-0 mt-0.5">•</span>
                      <span>{RED_FLAG_PLAIN[flag.flag_type] ?? flag.description ?? flag.flag_type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* What to do next */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8">
            <h2 className="text-lg font-bold text-blue-800 mb-2">🩺 What to Do Next</h2>
            <p className="text-blue-700 text-sm leading-relaxed">
              We recommend sharing these results with a <strong>qualified specialist</strong> — such as
              a developmental paediatrician, child psychologist, or speech-language therapist. They can
              provide a comprehensive clinical evaluation and discuss these findings in the context of your
              child&apos;s full developmental history.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 mb-8 text-center">
            <p className="text-slate-500 text-xs leading-relaxed">
              <strong className="text-slate-700">
                This report was generated by Horizons, a research-based screening tool.
              </strong>
              <br />
              It is <strong className="text-slate-700">not a medical diagnosis</strong>. Horizons is
              designed to help caregivers start a conversation with professionals — it does not replace
              a full clinical assessment. Always consult a qualified specialist before making decisions
              about your child&apos;s care.
            </p>
          </div>

          {/* Print button (Client Component) */}
          <div className="flex justify-center no-print">
            <PrintButton />
          </div>

        </div>
      </div>
    </>
  );
}
