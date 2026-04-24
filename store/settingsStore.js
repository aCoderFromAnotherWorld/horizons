import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      guideEmoji:    '🦊',
      sensoryLevel:  'medium', // 'low' | 'medium' | 'high'
      caregiverMode: false,

      setGuideEmoji:    (emoji)  => set({ guideEmoji: emoji }),
      setSensoryLevel:  (level)  => set({ sensoryLevel: level }),
      setCaregiverMode: (active) => set({ caregiverMode: active }),
    }),
    { name: 'horizons-settings' }
  )
);
