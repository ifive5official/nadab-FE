// 계정 복구 시 사용하는 store
// Todo: 비밀번호는 저장 안 해야 하는데....
import { create } from "zustand";
import createSelectors from "./createSelectors";

type State = {
  nickname: string;
  deletionDate: string;
  email: string;
  password: string;
};

type Action = {
  setNickname: (nickname: string) => void;
  setDeletionDate: (deletionDate: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  reset: () => void;
};

const useRestoreStoreBase = create<State & Action>((set, _get, store) => ({
  nickname: "",
  deletionDate: "",
  email: "",
  password: "",
  setNickname: (nickname: string) => set({ nickname }),
  setDeletionDate: (deletionDate: string) => set({ deletionDate }),
  setEmail: (email: string) => set({ email }),
  setPassword: (password: string) => set({ password }),
  reset: () => set(store.getInitialState),
}));

const useRestoreStore = createSelectors(useRestoreStoreBase);

export default useRestoreStore;
