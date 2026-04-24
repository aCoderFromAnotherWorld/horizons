'use client';

import { useSettingsStore } from '@/store/settingsStore.js';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { value: 'low',    label: 'Low',    emoji: '🤫' },
  { value: 'medium', label: 'Medium', emoji: '😊' },
  { value: 'high',   label: 'High',   emoji: '🎉' },
];

/**
 * Three-way toggle for sensory intensity (Low / Medium / High).
 * Reads and writes sensoryLevel in settingsStore.
 */
export default function SensoryToggle({ className }) {
  const sensoryLevel = useSettingsStore((s) => s.sensoryLevel);
  const setSensoryLevel = useSettingsStore((s) => s.setSensoryLevel);

  return (
    <div
      role="radiogroup"
      aria-label="Sensory intensity"
      className={cn('inline-flex rounded-2xl border border-border bg-muted p-1 gap-1', className)}
    >
      {OPTIONS.map(({ value, label, emoji }) => {
        const active = sensoryLevel === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setSensoryLevel(value)}
            className={cn(
              'flex min-h-10 min-w-16 flex-col items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition-all select-none',
              active
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <span className="text-xl leading-none">{emoji}</span>
            <span className="mt-0.5 text-xs">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
