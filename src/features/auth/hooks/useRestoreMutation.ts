import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import { useNavigate } from "@tanstack/react-router";
import type { components } from "@/generated/api-types";
import useAuthStore from "@/store/authStore";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type Res = components["schemas"]["TokenResponse"];

export function useRestoreMutation() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const res = await api.post<ApiResponse<Res>>("/api/v1/auth/restore", {
        email,
        password,
      });
      return res.data;
    },
    onSuccess: (res) => {
      const { accessToken } = res.data!;
      useAuthStore.getState().setAccessToken(accessToken!);
      navigate({ to: "/" });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
