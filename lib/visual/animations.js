/**
 * Returns a duration multiplier based on sensory level.
 * low = faster (0.5×), medium = normal (1×), high = slower/richer (1.5×)
 */
export function durationScale(sensoryLevel) {
  if (sensoryLevel === 'low') return 0.5;
  if (sensoryLevel === 'high') return 1.5;
  return 1;
}

/** Returns true if the user has requested reduced motion at the OS level. */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Slide-in from right — used for chapter page transitions. */
export const pageTransition = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { x: '-100%', opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } },
};

/** Scale 0 → 1 spring bounce — emoji reveals. */
export const popIn = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 20 },
  },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.15 } },
};

/** Subtle Y-axis oscillation for idle guide character. */
export const floatLoop = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
  },
};

/** Horizontal shake for wrong answers. */
export const shakeFeedback = {
  animate: {
    x: [0, -8, 8, -8, 8, -4, 4, 0],
    transition: { duration: 0.45, ease: 'easeInOut' },
  },
};

/** Scale spike + opacity flash for correct answers. */
export const celebrateBurst = {
  animate: {
    scale: [1, 1.35, 1],
    opacity: [1, 0.8, 1],
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

/** Cross-fade for dashboard tab content and level transitions. */
export const fadeSlide = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

/**
 * Returns scaled animation variants adjusted for the user's sensoryLevel.
 * Low sensory = faster durations; high sensory = longer/richer durations.
 *
 * @param {'low'|'medium'|'high'} sensoryLevel
 * @returns {{ pageTransition, popIn, floatLoop, shakeFeedback, celebrateBurst, fadeSlide }}
 */
export function getAnimations(sensoryLevel) {
  const s = durationScale(sensoryLevel);
  const reduced = prefersReducedMotion();

  return {
    pageTransition: reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.01 } }, exit: { opacity: 0, transition: { duration: 0.01 } } }
      : {
          initial: { x: '100%', opacity: 0 },
          animate: { x: 0, opacity: 1, transition: { duration: 0.35 * s, ease: 'easeOut' } },
          exit: { x: '-100%', opacity: 0, transition: { duration: 0.25 * s, ease: 'easeIn' } },
        },
    popIn: {
      initial: { scale: 0, opacity: 0 },
      animate: {
        scale: 1,
        opacity: 1,
        transition: reduced
          ? { duration: 0.01 }
          : { type: 'spring', stiffness: 400 / s, damping: 20 },
      },
      exit: { scale: 0, opacity: 0, transition: { duration: reduced ? 0.01 : 0.15 * s } },
    },
    floatLoop:
      reduced || sensoryLevel === 'low'
        ? { animate: { y: 0 } }
        : {
            animate: {
              y: [0, -8, 0],
              transition: { duration: 2.4 * s, repeat: Infinity, ease: 'easeInOut' },
            },
          },
    shakeFeedback: {
      animate: {
        x: reduced ? 0 : [0, -8, 8, -8, 8, -4, 4, 0],
        transition: { duration: reduced ? 0.01 : 0.45 * s, ease: 'easeInOut' },
      },
    },
    celebrateBurst: reduced
      ? { animate: { scale: 1, transition: { duration: 0.01 } } }
      : sensoryLevel === 'low'
        ? { animate: { scale: [1, 1.1, 1], transition: { duration: 0.2 } } }
        : {
            animate: {
              scale: [1, 1.35, 1],
              opacity: [1, 0.8, 1],
              transition: { duration: 0.4 * s, ease: 'easeOut' },
            },
          },
    fadeSlide: {
      initial: { opacity: 0, y: reduced ? 0 : 12 },
      animate: { opacity: 1, y: 0, transition: { duration: reduced ? 0.01 : 0.3 * s, ease: 'easeOut' } },
      exit: { opacity: 0, y: reduced ? 0 : -8, transition: { duration: reduced ? 0.01 : 0.2 * s } },
    },
  };
}
