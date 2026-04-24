import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGameStore = create(
  persist(
    (set) => ({
      sessionId:      null,
      playerAge:      null,
      playerName:     null,
      currentChapter: 1,
      currentLevel:   1,
      scores:         {},  // { chapterKey: points }
      redFlags:       [],  // string[]
      domainScores:   {},  // { domain: scoreObj }
      breakCount:     0,

      setSession: (sessionData) =>
        set({
          sessionId:   sessionData.sessionId,
          playerAge:   sessionData.playerAge ?? null,
          playerName:  sessionData.playerName ?? null,
        }),

      goToChapter: (chapter, level = 1) =>
        set({ currentChapter: chapter, currentLevel: level }),

      /** Additive only — points never decrease during a session. */
      addScore: (chapterKey, points) =>
        set((state) => ({
          scores: {
            ...state.scores,
            [chapterKey]: (state.scores[chapterKey] ?? 0) + points,
          },
        })),

      addRedFlag: (flagType) =>
        set((state) =>
          state.redFlags.includes(flagType)
            ? {}
            : { redFlags: [...state.redFlags, flagType] }
        ),

      setDomainScores: (domainScores) => set({ domainScores }),

      incrementBreak: () =>
        set((state) => ({ breakCount: state.breakCount + 1 })),

      reset: () =>
        set({
          sessionId:      null,
          playerAge:      null,
          playerName:     null,
          currentChapter: 1,
          currentLevel:   1,
          scores:         {},
          redFlags:       [],
          domainScores:   {},
          breakCount:     0,
        }),
    }),
    { name: 'horizons-game' }
  )
);
