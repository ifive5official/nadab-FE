// 비밀번호 찾기(비로그인) 시 사용
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";

type Req = components["schemas"]["ResetPasswordRequest"];

type Props = {
  onSuccess: () => void;
};

export function useFindPasswordMutation({ onSuccess }: Props) {
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
    onError: (err: AxiosError<ApiResponse<null>>) => {
      useErrorStore.getState().showError(
        // Todo: 에러 메시지 변경
        err.message,
        err.response?.data?.message ??
          "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요."
      );
    },
  });
}
