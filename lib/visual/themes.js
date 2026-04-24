export const CHAPTER_THEMES = {
  ch1: {
    name: 'My World',
    primary: '#6366f1',
    secondary: '#a78bfa',
    accent: '#fbbf24',
    gradient: 'radial-gradient(ellipse at 30% 40%, #a78bfa 0%, #6366f1 40%, #312e81 100%)',
    emoji: '💜',
  },
  ch2: {
    name: 'Feeling World',
    primary: '#f59e0b',
    secondary: '#fcd34d',
    accent: '#ef4444',
    gradient: 'radial-gradient(ellipse at 60% 30%, #fde68a 0%, #f59e0b 50%, #b45309 100%)',
    emoji: '🧡',
  },
  ch3: {
    name: 'Social World',
    primary: '#3b82f6',
    secondary: '#67e8f9',
    accent: '#f9a8d4',
    gradient: 'radial-gradient(ellipse at 40% 50%, #67e8f9 0%, #3b82f6 50%, #1e3a5f 100%)',
    emoji: '💙',
  },
  ch4: {
    name: 'Routine & Patterns',
    primary: '#10b981',
    secondary: '#86efac',
    accent: '#fde68a',
    gradient: 'radial-gradient(ellipse at 50% 60%, #86efac 0%, #10b981 50%, #064e3b 100%)',
    emoji: '💚',
  },
  ch5: {
    name: 'Pretend & Senses',
    primary: '#8b5cf6',
    secondary: '#f472b6',
    accent: '#c084fc',
    gradient: 'radial-gradient(ellipse at 35% 45%, #c084fc 0%, #8b5cf6 35%, #f472b6 70%, #7c3aed 100%)',
    emoji: '💜',
  },
  ch6: {
    name: 'Grand Finale',
    primary: '#eab308',
    secondary: '#fde68a',
    accent: '#f97316',
    gradient: 'radial-gradient(ellipse at 50% 40%, #fde68a 0%, #eab308 45%, #f97316 100%)',
    emoji: '⭐',
  },
  dashboard: {
    name: 'Dashboard',
    primary: '#0f172a',
    secondary: '#1e293b',
    accent: '#6366f1',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    emoji: '📊',
  },
  marketing: {
    name: 'Marketing',
    primary: '#f8fafc',
    secondary: '#e2e8f0',
    accent: '#6366f1',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
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
