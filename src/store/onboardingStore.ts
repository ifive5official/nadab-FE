import { create } from "zustand";
import createSelectors from "./createSelectors";

type State = {
  hasSeenIntro: boolean;
  category: string;
  nickname: string;
  profileImgUrl: string;
};

type Action = {
  updateHasSeenIntro: () => void;
  updateCategory: (category: State["category"]) => void;
  updateNickname: (nickname: State["nickname"]) => void;
  updateProfileImgUrl: (url: State["profileImgUrl"]) => void;
  reset: () => void;
};

const useOnboardingStoreBase = create<State & Action>()((set, _get, store) => ({
  hasSeenIntro: false,
  category: "",
  nickname: "",
  profileImgUrl: "",
  isSocialSignup: false,
  updateHasSeenIntro: () => set({ hasSeenIntro: true }),
  updateCategory: (category) => set(() => ({ category: category })),
  updateNickname: (nickname) => set(() => ({ nickname: nickname })),
  updateProfileImgUrl: (profileImgUrl) =>
    set(() => ({ profileImgUrl: profileImgUrl })),
  reset: () => set(store.getInitialState),
}));

const useOnboardingStore = createSelectors(useOnboardingStoreBase);

export default useOnboardingStore;
