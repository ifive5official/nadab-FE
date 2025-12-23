// 사이드바 열려있는지 닫혀있는지
import { create } from "zustand";
import createSelectors from "./createSelectors";

type State = {
  isSidebarOpen: boolean;
};

type Action = {
  toggleSidebar: () => void; // 열려있으면 닫고 닫혀있으면 열음
  openSidebar: () => void;
  closeSidebar: () => void;
};

const useSidebarStoreBase = create<State & Action>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
}));

const useSidebarStore = createSelectors(useSidebarStoreBase);

export default useSidebarStore;
