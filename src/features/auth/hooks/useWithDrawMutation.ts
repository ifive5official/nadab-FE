// 회원탈퇴
// 로그아웃까지 서버에서 자동 처리해줌
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import useAuthStore from "@/store/authStore";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

export function useWithDrawMutation() {
  const clearAuth = useAuthStore.use.clearAuth();

  return useMutation({
    mutationFn: async () => {
      await api.post("/api/v1/auth/withdrawal");
    },
    onSuccess: () => {
      clearAuth();
      window.location.href = "/bye"; // 탈퇴완료 페이지로 이동
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
