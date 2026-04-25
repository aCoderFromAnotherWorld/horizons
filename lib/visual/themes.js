export const CHAPTER_THEMES = {
  ch1: {
    name: 'My World',
    primary: '#5B21B6',
    secondary: '#7C3AED',
    accent: '#C4B5FD',
    // Warm dusk violet — twilight sky, not void-black
    gradient: 'linear-gradient(150deg, #2D1060 0%, #4A1D96 28%, #5B21B6 55%, #7C3AED 80%, #8B5CF6 100%)',
    textColor: '#EDE9FE',
    emoji: '💜',
  },
  ch2: {
    name: 'Feeling World',
    primary: '#B45309',
    secondary: '#D97706',
    accent: '#FDE68A',
    // Warm amber sunrise — rich but not harsh
    gradient: 'linear-gradient(150deg, #431A03 0%, #6B2A06 25%, #92400E 50%, #B45309 75%, #D97706 100%)',
    textColor: '#FEF3C7',
    emoji: '🧡',
  },
  ch3: {
    name: 'Social World',
    primary: '#1D4ED8',
    secondary: '#3B82F6',
    accent: '#BFDBFE',
    // Deep ocean blue — calm and professional
    gradient: 'linear-gradient(150deg, #0C1B5E 0%, #1532A8 28%, #1D4ED8 55%, #2563EB 78%, #3B82F6 100%)',
    textColor: '#DBEAFE',
    emoji: '💙',
  },
  ch4: {
    name: 'Routine & Patterns',
    primary: '#065F46',
    secondary: '#059669',
    accent: '#A7F3D0',
    // Forest green — natural and grounding
    gradient: 'linear-gradient(150deg, #063830 0%, #065F46 30%, #047857 55%, #059669 78%, #10B981 100%)',
    textColor: '#D1FAE5',
    emoji: '💚',
  },
  ch5: {
    name: 'Pretend & Senses',
    primary: '#7E22CE',
    secondary: '#9333EA',
    accent: '#E9D5FF',
    // Warm plum-violet — imaginative, not harsh
    gradient: 'linear-gradient(150deg, #3B0764 0%, #6B21A8 30%, #7E22CE 55%, #9333EA 78%, #A855F7 100%)',
    textColor: '#F3E8FF',
    emoji: '✨',
  },
  ch6: {
    name: 'Grand Finale',
    primary: '#B45309',
    secondary: '#D97706',
    accent: '#FDE68A',
    // Warm golden amber — dignified celebration
    gradient: 'linear-gradient(150deg, #431407 0%, #713F12 25%, #92400E 50%, #B45309 75%, #D97706 100%)',
    textColor: '#FEF9C3',
    emoji: '⭐',
  },
  dashboard: {
    name: 'Dashboard',
    primary: '#1E293B',
    secondary: '#334155',
    accent: '#4338CA',
    gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
    textColor: '#F1F5F9',
    emoji: '📊',
  },
  marketing: {
    name: 'Marketing',
    primary: '#F7F5F2',
    secondary: '#E8E4DE',
    accent: '#2f4abf',
    gradient: 'linear-gradient(135deg, #F7F5F2 0%, #E8E4DE 100%)',
    textColor: '#0F172A',
    emoji: '🌟',
  },
};

/** Returns the theme object for a given chapter number (1–6) or key name. */
export function getTheme(chapterOrKey) {
  if (typeof chapterOrKey === 'number') {
    return CHAPTER_THEMES[`ch${chapterOrKey}`] ?? CHAPTER_THEMES.ch1;
  }
  return CHAPTER_THEMES[chapterOrKey] ?? CHAPTER_THEMES.ch1;
}
