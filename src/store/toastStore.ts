// 전역 토스트를 관리하는 store
import { create } from "zustand";
import createSelectors from "./createSelectors";

type ToastConfig = {
  bottom?: string; // tailwind class spacing 값 받음
  message: string;
};

type State = {
  isOpen: boolean;
  config: ToastConfig | null;
};

type Action = {
  showToast: (config: ToastConfig) => void;
  closeToast: () => void;
};

const useToastStoreBase = create<State & Action>((set) => ({
  isOpen: false,
  config: null,
  showToast: (config) => set({ isOpen: true, config }),
  closeToast: () => set({ isOpen: false }),
}));

const useToastStore = createSelectors(useToastStoreBase);

export default useToastStore;
