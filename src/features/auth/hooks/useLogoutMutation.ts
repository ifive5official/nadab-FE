import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import useAuthStore from "@/store/authStore";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

export function useLogoutMutation() {
  const clearAuth = useAuthStore.use.clearAuth();

  return useMutation({
    mutationFn: async () => {
      await api.post("/api/v1/auth/logout");
    },
    onSuccess: () => {
      clearAuth();
      window.location.href = "/";
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
