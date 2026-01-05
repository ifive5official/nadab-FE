// 일반(이메일) 회원가입 시 사용
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import useAuthStore from "@/store/authStore";

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
      useErrorStore.getState().showError(
        // Todo: 에러 메시지 변경
        err.response?.data?.code ?? err.message,
        err.response?.data?.message ??
          "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요."
      );
    },
  });
}
