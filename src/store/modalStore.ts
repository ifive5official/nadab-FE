// 전역 모달을 관리하는 store
import { create } from "zustand";
import createSelectors from "./createSelectors";
import { WarningFilledIcon } from "@/components/Icons";

type ModalConfig = {
  icon: React.ComponentType;
  title: string;
  children?: React.ReactNode;
  buttons: {
    label: string;
    onClick: () => void;
  }[];
};

type State = {
  isOpen: boolean;
  config: ModalConfig | null;
};

type Action = {
  showModal: (config: ModalConfig) => void;
  showError: (title: string, message?: string) => void;
  closeModal: () => void;
};

const useModalStoreBase = create<State & Action>((set) => ({
  isOpen: false,
  config: null,
  showModal: (config) => set({ isOpen: true, config }),
  showError: (title, message) =>
    set({
      isOpen: true,
      config: {
        icon: WarningFilledIcon,
        title,
        children: message,
        buttons: [{ label: "확인", onClick: () => set({ isOpen: false }) }],
      },
    }),
  closeModal: () => set({ isOpen: false }),
}));

const useModalStore = createSelectors(useModalStoreBase);

export default useModalStore;
