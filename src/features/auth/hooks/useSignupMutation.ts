// 일반(이메일) 회원가입 시 사용
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import useAuthStore from "@/store/authStore";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type Req = components["schemas"]["SignupRequest"];
type Res = components["schemas"]["TokenResponse"];

type Props = {
  onSuccess: () => void;
};

export function useSignupMutation({ onSuccess }: Props) {
  return useMutation({
    mutationFn: async ({
      email,
      password,
      service,
      privacy,
      ageVerification,
      marketing,
    }: Req) => {
      const res = await api.post<ApiResponse<Res>>("/api/v1/auth/signup", {
        email,
        password,
        service,
        privacy,
        ageVerification,
        marketing,
      });
      return res.data;
    },
    onSuccess: (res) => {
      const { accessToken } = res.data!;
      useAuthStore.getState().setAccessToken(accessToken!);
      onSuccess();
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
