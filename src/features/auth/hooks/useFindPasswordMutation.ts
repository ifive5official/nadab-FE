// 비밀번호 찾기(비로그인) 시 사용
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";

type Req = components["schemas"]["ResetPasswordRequest"];

type Props = {
  onSuccess: () => void;
  onPasswordInvalid: (message: string) => void;
};

export function useFindPasswordMutation({
  onSuccess,
  onPasswordInvalid,
}: Props) {
  return useMutation({
    mutationFn: async ({ email, newPassword }: Req) => {
      const res = await api.post("/api/v1/auth/password/reset", {
        email,
        newPassword,
      });
      return res.data;
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      if (err.response?.data?.code === "AUTH_PASSWORD_REUSE_NOT_ALLOWED") {
        onPasswordInvalid(
          "이전 비밀번호와 동일한 비밀번호는 사용할 수 없어요."
        );
      } else {
        useErrorStore.getState().showError(
          // Todo: 에러 메시지 변경
          err.response?.data?.code ?? err.message,
          err.response?.data?.message ??
            "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요."
        );
      }
    },
  });
}
