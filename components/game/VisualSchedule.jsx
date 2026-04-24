'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils.js';

/**
 * Horizontal scrollable strip showing remaining tasks in the current level.
 * Props:
 *   tasks       — array of { emoji: string, label: string }
 *   currentIndex — zero-based index of the active task
 */
export default function VisualSchedule({ tasks = [], currentIndex = 0 }) {
  if (tasks.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto scrollbar-none py-2 px-3">
      <div className="flex items-center gap-2 min-w-max mx-auto">
        {tasks.map((task, i) => {
          const done    = i < currentIndex;
          const active  = i === currentIndex;
          const upcoming = i > currentIndex;

          return (
            <div key={i} className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={{
                  scale: active ? 1 : 0.85,
                  opacity: done ? 0.4 : upcoming ? 0.6 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={cn(
                  'flex flex-col items-center justify-center rounded-2xl px-3 py-2 min-w-[56px] text-center',
                  active
                    ? 'bg-white/30 ring-2 ring-white shadow-lg'
                    : done
                    ? 'bg-white/10'
                    : 'bg-white/15'
                )}
              >
                <span className="text-2xl leading-none">{done ? '✅' : task.emoji}</span>
                <span className={cn('text-xs mt-0.5 font-medium text-white', done && 'line-through opacity-60')}>
                  {task.label}
                </span>
              </motion.div>

              {/* Connector dot */}
              {i < tasks.length - 1 && (
                <div
                  className="w-4 h-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: done ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
