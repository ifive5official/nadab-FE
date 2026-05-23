// 전역 하단 모달을 관리하는 store
import { create } from "zustand";
import createSelectors from "./createSelectors";

export type Item = {
  type?: "normal" | "warning" | "selected" | "unselected";
  label: string;
  onClick: () => void;
};

export type BottomModalConfig = {
  title: string;
  items: Item[];
};

type State = {
  isOpen: boolean;
  config: BottomModalConfig | null;
};

type Action = {
  showBottomModal: (config: BottomModalConfig) => void;
  closeBottomModal: () => void;
};

const useModalStoreBase = create<State & Action>((set) => ({
  isOpen: false,
  config: null,
  showBottomModal: (config) => set({ isOpen: true, config }),
  closeBottomModal: () => set({ isOpen: false }),
}));

const useBottomModalStore = createSelectors(useModalStoreBase);

export default useBottomModalStore;
