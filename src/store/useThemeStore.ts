// 라이트모드/다크모드 관리 store
import { create } from "zustand";
import { persist } from "zustand/middleware";
import createSelectors from "./createSelectors";

type ThemeState = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

export const useThemeStoreBase = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: "theme-storage", // 로컬 스토리지 키
    }
  )
);

const useThemeStore = createSelectors(useThemeStoreBase);

export default useThemeStore;
