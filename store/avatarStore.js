import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialAvatar = {
  hair: 0,
  clothes: 0,
  hairColor: 0,
  clothesColor: 0,
};

export const useAvatarStore = create(
  persist(
    (set) => ({
      ...initialAvatar,
      setHair: (hair) => set({ hair }),
      setClothes: (clothes) => set({ clothes }),
      setHairColor: (hairColor) => set({ hairColor }),
      setClothesColor: (clothesColor) => set({ clothesColor }),
      setAvatar: (avatar) => set((state) => ({ ...state, ...avatar })),
      reset: () => set(initialAvatar),
    }),
    { name: "horizons-avatar-store" },
  ),
);
