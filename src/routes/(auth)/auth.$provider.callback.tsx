import { api } from "@/lib/axios";
import { createFileRoute, isRedirect } from "@tanstack/react-router";
import { z } from "zod";
import { redirect } from "@tanstack/react-router";
import useAuthStore from "@/store/authStore";
import type { components } from "@/generated/api-types";
import type { ApiResponse } from "@/generated/api";
import axios from "axios";
import useErrorStore from "@/store/modalStore";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type LoginRes = components["schemas"]["TokenResponse"];

export const Route = createFileRoute("/(auth)/auth/$provider/callback")({
  component: RouteComponent,
  validateSearch: z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional(),
    error_description: z.string().optional(),
  }),
  loaderDeps: ({ search }) => ({ ...search }),
  loader: async ({ deps: { code, state, error }, params: { provider } }) => {
    // 취소 시 홈으로 리다이렉트
    if (error || !code) {
      throw redirect({ to: "/", replace: true });
    }
    try {
      const res = await api.post<ApiResponse<LoginRes>>(
        `/api/v1/auth/${provider}/login`,
        {
          code,
          state,
        },
      );
      const { accessToken, signupStatus } = res.data.data!;

      useAuthStore.getState().setAccessToken(accessToken!);

      switch (signupStatus) {
        case "PROFILE_INCOMPLETE":
          throw redirect({
            to: "/signup/terms",
            replace: true,
            search: { type: "social" },
          });
        case "WITHDRAWN":
          // Todo: 회원탈퇴시 처리
          break;
        default: // COMPLETED
          throw redirect({ to: "/", replace: true });
      }
    } catch (err: unknown) {
      // 리다이렉트면 넘어가기
      if (isRedirect(err)) {
        throw err;
      }
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        // 이미 일반 로그인으로 가입한 계정일 시
        useErrorStore
          .getState()
          .showError(
            "이미 가입한 계정이에요.",
            "다른 계정으로 가입해보세요.",
            true,
          );
      } else if (axios.isAxiosError(err)) {
        handleDefaultApiError(err);
      }
      throw redirect({
        to: "/",
        replace: true,
      });
    }
  },
});

function RouteComponent() {
  return null;
}
