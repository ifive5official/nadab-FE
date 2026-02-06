// 비밀번호 찾기(비로그인) 시 사용
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

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
          "이전 비밀번호와 동일한 비밀번호는 사용할 수 없어요.",
        );
      } else {
        handleDefaultApiError(err);
      }
    },
  });
}
