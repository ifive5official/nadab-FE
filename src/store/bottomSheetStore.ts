// 전역 바텀시트  관리하는 store
import { create } from "zustand";
import createSelectors from "./createSelectors";

type BottomSheetConfig = {
  title: string;
  content: React.ReactNode;
};

type State = {
  isOpen: boolean;
  config: BottomSheetConfig | null;
};

type Action = {
  showBottomSheet: (config: BottomSheetConfig) => void;
  closeBottomSheet: () => void;
};

const useSheetStoreBase = create<State & Action>((set) => ({
  isOpen: false,
  config: null,
  showBottomSheet: (config) => set({ isOpen: true, config }),
  closeBottomSheet: () => set({ isOpen: false }),
}));

const useBottomSheetStore = createSelectors(useSheetStoreBase);

export default useBottomSheetStore;
