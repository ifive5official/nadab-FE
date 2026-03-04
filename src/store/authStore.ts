// access token 저장
import { create } from "zustand";
import createSelectors from "./createSelectors";

type State = {
  accessToken: null | string;
  deviceId: null | string; // 앱에서 사용
};

type Action = {
  setAccessToken: (token: string) => void;
  setDeviceId: (id: string) => void; // 앱에서 사용
  clearAuth: () => void;
};

const useAuthStoreBase = create<State & Action>((set) => ({
  accessToken: null,
  deviceId: null,
  setAccessToken: (token: string) => set({ accessToken: token }),
  setDeviceId: (id: string) => set({ deviceId: id }),
  clearAuth: () => set({ accessToken: null }),
}));

const useAuthStore = createSelectors(useAuthStoreBase);

export default useAuthStore;
