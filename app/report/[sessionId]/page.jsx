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
    color: '#065F46',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    badge: '🟢',
    short: 'Typical Range',
    desc: 'Responses in this area were within the typical range for this age group. No immediate concerns identified.',
  },
  medium: {
    color: '#92400E',
    bg: '#FFFBEB',
    border: '#FDE68A',
    badge: '🟡',
    short: 'Some Differences Noted',
    desc: 'Some differences were observed in this area. Consider mentioning these findings to a specialist during a routine visit.',
  },
  high: {
    color: '#9A3412',
    bg: '#FFF7ED',
    border: '#FED7AA',
    badge: '🟠',
    short: 'Notable Differences',
    desc: 'Noticeable differences were observed. Consulting a qualified specialist for a more detailed assessment is recommended.',
  },
  very_high: {
    color: '#991B1B',
    bg: '#FEF2F2',
    border: '#FECACA',
    badge: '🔴',
    short: 'Significant Differences',
    desc: 'Significant differences were observed in this area. We recommend consulting a qualified specialist for further assessment.',
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4" style={{ background: '#FAFAF8' }}>
      <span className="text-6xl">🔒</span>
      <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Report Unavailable</h1>
      <p className="max-w-sm text-sm" style={{ color: '#57534E' }}>{message}</p>
    </div>
  );
}

export default async function ReportPage({ params, searchParams }) {
  const { sessionId } = await params;
  const { token } = await searchParams;

  let session;
  try {
    session = await getSession(sessionId);
  } catch {
    return <ErrorPage message="Could not load session data. Please try again later." />;
  }

  if (!session) {
    return <ErrorPage message="Session not found. This report may have been removed." />;
  }

  if (!session.completed_at) {
    return <ErrorPage message="Results are not yet available. Please complete the game first, then return to this link." />;
  }

  const completedAt = session.completed_at;
  if (!token || !verifyReportToken(sessionId, completedAt, token)) {
    return <ErrorPage message="This report link is invalid or has expired. Please use the link provided at the end of the game." />;
  }

  const [domainScores, redFlags] = await Promise.all([
    getDomainScoresBySession(sessionId),
    getRedFlagsBySession(sessionId),
  ]);

  const childName = session.player_name || 'Your Child';
  const firstName = childName.split(' ')[0];
  const dateStr = new Date(completedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

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
          nav, footer, header, aside { display: none !important; }
          body { background: #ffffff !important; font-size: 11pt !important; }
          .report-card { box-shadow: none !important; border: 1px solid #E5E7EB !important; break-inside: avoid; }
          .report-header { padding-top: 0 !important; }
          @page { margin: 1.8cm 1.5cm; size: A4; }
        }
      `}</style>

      {/* Full-page layout: topbar + scrollable body */}
      <div className="flex flex-col min-h-screen" style={{ background: '#FAFAF8' }}>

        {/* Topbar — fixed height, does not overlap content */}
        <div
          className="no-print sticky top-0 z-20 w-full px-4 shrink-0"
          style={{
            background: '#FAFAF8',
            borderBottom: '1px solid #E7E5E4',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="flex items-center gap-2 font-extrabold text-lg" style={{ color: '#0F172A' }}>
            <span>🧠</span>
            <span>Horizons</span>
          </div>
          <PrintButton label="Save as PDF" />
        </div>

        {/* Scrollable content — starts below topbar due to flex layout */}
        <div className="flex-1 py-10 px-4">
          <div className="max-w-2xl mx-auto space-y-5">

            {/* Header */}
            <div className="report-header text-center pb-6" style={{ borderBottom: '2px solid #E7E5E4' }}>
              <div className="text-5xl mb-3 select-none">🌟</div>
              <h1 className="text-2xl font-extrabold mb-1" style={{ color: '#0F172A' }}>
                Horizons Screening Summary
              </h1>
              <p className="text-sm" style={{ color: '#78716C' }}>
                {firstName} &middot; {dateStr}
              </p>
            </div>

            {/* Overall risk */}
            <div
              className="report-card flex items-start gap-4 rounded-2xl p-5"
              style={{
                background: overallDisplay.bg,
                border: `1px solid ${overallDisplay.border}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <span className="text-4xl select-none shrink-0">{overallDisplay.badge}</span>
              <div>
                <p className="font-bold text-lg mb-0.5" style={{ color: overallDisplay.color }}>
                  {overallDisplay.short}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#44403C' }}>
                  {overallDisplay.desc}
                </p>
              </div>
            </div>

            {/* Domain results */}
            <div>
              <h2 className="text-base font-bold mb-3" style={{ color: '#0F172A' }}>Domain Results</h2>
              <div className="flex flex-col gap-3">
                {domainScores.map(ds => {
                  const info    = DOMAIN_INFO[ds.domain] ?? { emoji: '📊', name: ds.domain, description: '' };
                  const display = RISK_DISPLAY[ds.risk_level] ?? RISK_DISPLAY.low;
                  return (
                    <div
                      key={ds.domain}
                      className="report-card bg-white rounded-2xl p-4 flex items-start gap-4"
                      style={{ border: '1px solid #E7E5E4', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
                    >
                      <span className="text-3xl shrink-0 select-none">{info.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <p className="font-bold text-sm" style={{ color: '#0F172A' }}>{info.name}</p>
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                            style={{ background: display.bg, color: display.color, border: `1px solid ${display.border}` }}
                          >
                            {display.badge} {display.short}
                          </span>
                        </div>
                        <p className="text-xs leading-snug" style={{ color: '#57534E' }}>{display.desc}</p>
                        <p className="text-xs mt-1 leading-snug" style={{ color: '#A8A29E' }}>{info.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Red flags */}
            {redFlags.length > 0 && (
              <div>
                <h2 className="text-base font-bold mb-3" style={{ color: '#0F172A' }}>Areas to Explore</h2>
                <div
                  className="report-card rounded-2xl p-4"
                  style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
                >
                  <ul className="space-y-2">
                    {redFlags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#92400E' }}>
                        <span className="shrink-0 mt-0.5 font-bold">•</span>
                        <span>{RED_FLAG_PLAIN[flag.flag_type] ?? flag.description ?? flag.flag_type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Next steps */}
            <div
              className="report-card rounded-2xl p-5"
              style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
            >
              <h2 className="text-base font-bold mb-2" style={{ color: '#1D4ED8' }}>🩺 What to Do Next</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#1E40AF' }}>
                We recommend sharing these results with a{' '}
                <strong>qualified specialist</strong> — such as a developmental paediatrician, child
                psychologist, or speech-language therapist. They can provide a comprehensive clinical
                evaluation and discuss these findings in the context of your child&apos;s full
                developmental history.
              </p>
            </div>

            {/* Disclaimer */}
            <div
              className="report-card rounded-2xl p-5 text-center"
              style={{ background: '#FFFFFF', border: '2px solid #E7E5E4' }}
            >
              <p className="text-xs leading-relaxed" style={{ color: '#57534E' }}>
                <strong style={{ color: '#0F172A' }}>
                  This report was generated by Horizons, a research-based screening tool.
                </strong>
                <br />
                It is{' '}
                <strong style={{ color: '#0F172A' }}>not a medical diagnosis</strong>. Horizons is
                designed to help caregivers start a conversation with professionals — it does not replace
                a full clinical assessment. Always consult a qualified specialist before making decisions
                about your child&apos;s care.
              </p>
            </div>

            {/* Bottom PDF button */}
            <div className="no-print flex justify-center pt-2 pb-6">
              <PrintButton label="Save as PDF" />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
