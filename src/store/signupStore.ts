import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import createSelectors from "./createSelectors";

type State = {
  isTermsAgreed: boolean;
  email: string;
  isEmailVerified: boolean;
  password: string;
  hasSeenIntro: boolean;
  category: string;
  nickname: string;
  profileImgUrl: string;
  isSocialSignup: boolean;
};

type Action = {
  updateIsTermsAgreed: () => void;
  updateEmail: (email: State["email"]) => void;
  updateIsEmailVerified: () => void;
  updatePassword: (password: State["password"]) => void;
  updateHasSeenIntro: () => void;
  updateCategory: (category: State["category"]) => void;
  updateNickname: (nickname: State["nickname"]) => void;
  updateProfileImgUrl: (url: State["profileImgUrl"]) => void;
  setIsSocialSignup: () => void;
  reset: () => void;
};

const useSignupStoreBase = create<State & Action>()(
  persist(
    (set, _get, store) => ({
      isTermsAgreed: false,
      email: "",
      isEmailVerified: false,
      password: "",
      hasSeenIntro: false,
      category: "",
      nickname: "",
      profileImgUrl: "",
      isSocialSignup: false,
      updateIsTermsAgreed: () => set({ isTermsAgreed: true }),
      updateEmail: (email) => set(() => ({ email: email })),
      updateIsEmailVerified: () => set({ isEmailVerified: true }),
      updatePassword: (password) => set(() => ({ password: password })),
      updateHasSeenIntro: () => set({ hasSeenIntro: true }),
      updateCategory: (category) => set(() => ({ category: category })),
      updateNickname: (nickname) => set(() => ({ nickname: nickname })),
      updateProfileImgUrl: (profileImgUrl) =>
        set(() => ({ profileImgUrl: profileImgUrl })),
      setIsSocialSignup: () => set({ isSocialSignup: true }),
      reset: () => set(store.getInitialState),
    }),
    {
      name: "signup-storage",
      storage: createJSONStorage(() => sessionStorage),
      // 이메일 인증코드 확인하러 다른 앱 갈 때 상태 리셋되지 않도록
      // 이 둘만 세션스토리지에 별도 저장
      partialize: (state) => ({
        isTermsAgreed: state.isTermsAgreed,
        email: state.email,
      }),
    }
  )
);

const useSignupStore = createSelectors(useSignupStoreBase);

export default useSignupStore;
