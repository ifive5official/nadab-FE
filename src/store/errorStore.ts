// 전역 에러 처리 모달을 관리하는 store
import { create } from "zustand";
import createSelectors from "./createSelectors";

type State = {
  isOpen: boolean;
  title: string;
  message: string;
};

type Action = {
  showError: (title: string, message?: string) => void;
  closeError: () => void;
};

const useErrorStoreBase = create<State & Action>((set) => ({
  isOpen: false,
  title: "",
  message: "",
  showError: (title: string, message?: string) =>
    set({ isOpen: true, title, message }),
  closeError: () => set({ isOpen: false, title: "", message: "" }),
}));

const useErrorStore = createSelectors(useErrorStoreBase);

export default useErrorStore;
