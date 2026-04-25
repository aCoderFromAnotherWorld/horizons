import { getAuthenticatedUser } from '@/lib/dashboardAuth.js';
import { listAllSessions } from '@/lib/db/queries/sessions.js';
import { getDomainScoresBySession } from '@/lib/db/queries/domainScores.js';
import { getRedFlagsBySession } from '@/lib/db/queries/redFlags.js';

const CSV_COLS = [
  'id', 'player_name', 'player_age', 'status', 'started_at', 'completed_at',
  'guide_choice', 'sensory_level',
  'sc_raw', 'rr_raw', 'pp_raw', 'sp_raw',
  'sc_risk', 'rr_risk', 'pp_risk', 'sp_risk',
  'red_flag_count', 'red_flag_types',
];

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export async function GET(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const format = searchParams.get('format') ?? 'json';
  const from   = searchParams.get('from');
  const to     = searchParams.get('to');

  try {
    let sessions = await listAllSessions();

    if (from) {
      const fromMs = Number(from) || new Date(from).getTime();
      sessions = sessions.filter((s) => s.started_at >= fromMs);
    }
    if (to) {
      const toMs = Number(to) || new Date(to).getTime();
      sessions = sessions.filter((s) => s.started_at <= toMs);
    }

    const rows = await Promise.all(
      sessions.map(async (s) => {
        const [domainScores, redFlags] = await Promise.all([
          getDomainScoresBySession(s.id),
          getRedFlagsBySession(s.id),
        ]);
        return { ...s, domainScores, redFlags };
      })
    );

    if (format === 'csv') {
      const lines = [CSV_COLS.join(',')];
      for (const r of rows) {
        const sc = r.domainScores.find((d) => d.domain === 'social_communication');
        const rr = r.domainScores.find((d) => d.domain === 'restricted_repetitive');
        const pp = r.domainScores.find((d) => d.domain === 'pretend_play');
        const sp = r.domainScores.find((d) => d.domain === 'sensory_processing');
        lines.push([
          csvEscape(r.id),
          csvEscape(r.player_name),
          csvEscape(r.player_age),
          csvEscape(r.status),
          csvEscape(r.started_at),
          csvEscape(r.completed_at),
          csvEscape(r.guide_choice),
          csvEscape(r.sensory_level),
          csvEscape(sc?.raw_score),
          csvEscape(rr?.raw_score),
          csvEscape(pp?.raw_score),
          csvEscape(sp?.raw_score),
          csvEscape(sc?.risk_level),
          csvEscape(rr?.risk_level),
          csvEscape(pp?.risk_level),
          csvEscape(sp?.risk_level),
          csvEscape(r.redFlags.length),
          csvEscape(r.redFlags.map((f) => f.flag_type).join('|')),
        ].join(','));
      }
      return new Response('﻿' + lines.join('\r\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="horizons-export.csv"',
        },
      });
    }

    return new Response(JSON.stringify(rows), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="horizons-export.json"',
      },
    });
  } catch (err) {
    console.error('[GET /api/dashboard/export]', err);
    return Response.json({ error: 'Export failed' }, { status: 500 });
  }
}
