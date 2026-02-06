// 비밀번호 변경(로그인)시 사용
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import useAuthStore from "@/store/authStore";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type Req = components["schemas"]["ChangePasswordRequest"];
type Res = components["schemas"]["TokenResponse"];

type Props = {
  onSuccess: () => void;
  onPasswordInvalid: (code: string) => void;
};

export function useChangePasswordMutation({
  onSuccess,
  onPasswordInvalid,
}: Props) {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: Req) => {
      const res = await api.patch<ApiResponse<Res>>("/api/v1/auth/password", {
        currentPassword,
        newPassword,
      });
      return res.data;
    },
    onSuccess: (res) => {
      const { accessToken } = res.data!;
      useAuthStore.getState().setAccessToken(accessToken!);
      onSuccess();
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      if (err.response?.data?.code) {
        onPasswordInvalid(err.response?.data?.code);
      } else {
        handleDefaultApiError(err);
      }
    },
  });
}
