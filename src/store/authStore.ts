// access token 저장
import { create } from "zustand";
import createSelectors from "./createSelectors";

type State = {
  accessToken: null | string;
};

type Action = {
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
};

const useAuthStoreBase = create<State & Action>((set) => ({
  accessToken: null,
  setAccessToken: (token: string) => set({ accessToken: token }),
  clearAuth: () => set({ accessToken: null }),
}));

const useAuthStore = createSelectors(useAuthStoreBase);

export default useAuthStore;
