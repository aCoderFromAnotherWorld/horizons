'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Touch-friendly button with minimum 64×64px target area.
 * Wraps ShadCN Button with appropriate sizing for in-game use.
 */
export default function BigButton({ children, className, ...props }) {
  return (
    <Button
      className={cn(
        'min-h-16 min-w-16 text-lg px-6 py-4 rounded-2xl font-semibold select-none',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
