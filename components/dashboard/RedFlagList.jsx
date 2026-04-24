import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils.js';

const FLAG_LABELS = {
  negative_emotion_recognition_under_50: 'Negative Emotion Recognition <50%',
  complete_absence_pretend_play:         'Complete Absence of Pretend Play',
  extreme_sensory_distress:              'Extreme Sensory Distress',
  rigid_pattern_distress:                'Rigid Pattern Distress',
  poor_imitation_all_modalities:         'Poor Imitation (All Modalities)',
};

const SEVERITY_STYLES = {
  mild:     'bg-blue-100 text-blue-700 border-transparent',
  moderate: 'bg-amber-100 text-amber-700 border-transparent',
  severe:   'bg-red-100 text-red-700 border-transparent',
};

/**
 * Props:
 *   redFlags — array of { flagType, description, severity }
 */
export default function RedFlagList({ redFlags = [] }) {
  if (!redFlags.length) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium py-2">
        <span className="text-lg">✅</span>
        No red flags detected
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {redFlags.map((flag, i) => (
        <li key={i} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
          <Badge
            className={cn(
              'text-xs font-semibold shrink-0 mt-0.5',
              SEVERITY_STYLES[flag.severity] ?? SEVERITY_STYLES.moderate
            )}
          >
            {flag.severity ?? 'moderate'}
          </Badge>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-700 leading-tight">
              {FLAG_LABELS[flag.flagType] ?? flag.flagType}
            </p>
            {flag.description && (
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{flag.description}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
