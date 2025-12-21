// 비밀번호 변경(로그인)시 사용
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import useAuthStore from "@/store/authStore";

type Req = components["schemas"]["ChangePasswordRequest"];
type Res = components["schemas"]["TokenResponse"];

type Props = {
  onSuccess: () => void;
  onPasswordInvalid: (message: string) => void;
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
    onError: (err: AxiosError<ApiResponse<null>>) => {
      if (err.response?.status === 400) {
        onPasswordInvalid(err.response?.data.message ?? "");
      } else if (err.response?.status === 401) {
        onPasswordInvalid(err.response?.data.message ?? "");
      } else {
        useErrorStore.getState().showError(
          // Todo: 에러 메시지 변경
          err.message,
          err.response?.data?.message ??
            "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요."
        );
      }
    },
  });
}
