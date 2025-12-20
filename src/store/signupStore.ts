import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import createSelectors from "./createSelectors";

type State = {
  isRequiredTermsAgreed: boolean;
  isMarketingTermsAgreed: boolean;
  email: string;
  isEmailVerified: boolean;
  password: string;
};

type Action = {
  updateIsRequiredTermsAgreed: () => void;
  updateIsMarketingTermsAgreed: () => void;
  updateEmail: (email: State["email"]) => void;
  updateIsEmailVerified: () => void;
  updatePassword: (password: State["password"]) => void;
  reset: () => void;
};

const useSignupStoreBase = create<State & Action>()(
  persist(
    (set, _get, store) => ({
      isRequiredTermsAgreed: false,
      isMarketingTermsAgreed: false,
      email: "",
      isEmailVerified: false,
      password: "",
      updateIsRequiredTermsAgreed: () => set({ isRequiredTermsAgreed: true }),
      updateIsMarketingTermsAgreed: () => set({ isMarketingTermsAgreed: true }),
      updateEmail: (email) => set(() => ({ email: email })),
      updateIsEmailVerified: () => set({ isEmailVerified: true }),
      updatePassword: (password) => set(() => ({ password: password })),
      reset: () => set(store.getInitialState),
    }),
    {
      name: "signup-storage",
      storage: createJSONStorage(() => sessionStorage),
      // 이메일 인증코드 확인하러 다른 앱 갈 때 상태 리셋되지 않도록
      // 이 둘만 세션스토리지에 별도 저장
      partialize: (state) => ({
        isRequiredTermsAgreed: state.isRequiredTermsAgreed,
        isMarketingTermsAgreed: state.isMarketingTermsAgreed,
        email: state.email,
      }),
    }
  )
);

const useSignupStore = createSelectors(useSignupStoreBase);

export default useSignupStore;
