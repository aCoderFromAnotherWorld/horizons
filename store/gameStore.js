import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Session
      sessionId: null,
      playerAge: null,
      playerName: null,

      // Navigation
      currentChapter: 1,
      currentLevel: 1,

      // In-memory scores (synced to DB via API)
      scores: {}, // { 'ch2_emotion': 12, ... }
      redFlags: [],
      domainScores: {},

      // Helpers
      setSession: (id, age, name) =>
        set({ sessionId: id, playerAge: age, playerName: name }),

      goToChapter: (chapter, level = 1) =>
        set({ currentChapter: chapter, currentLevel: level }),

      addScore: (key, points) =>
        set((s) => ({
          scores: { ...s.scores, [key]: (s.scores[key] || 0) + points },
        })),

      addRedFlag: (flag) => set((s) => ({ redFlags: [...s.redFlags, flag] })),

      reset: () =>
        set({
          sessionId: null,
          playerAge: null,
          playerName: null,
          currentChapter: 1,
          currentLevel: 1,
          scores: {},
          redFlags: [],
          domainScores: {},
        }),
    }),
    { name: "horizons-game-store" },
  ),
);
