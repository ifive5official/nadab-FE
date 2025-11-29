import { api } from "@/lib/axios";
import { createFileRoute, isRedirect } from "@tanstack/react-router";
import { z } from "zod";
import { redirect } from "@tanstack/react-router";
import useAuthStore from "@/store/authStore";
import useSignupStore from "@/store/signupStore";
import type { components } from "@/generated/api-types";
import type { ApiResponse } from "@/generated/api";

type LoginRes = components["schemas"]["TokenResponse"];

export const Route = createFileRoute("/(auth)/auth/naver/callback")({
  component: RouteComponent,
  validateSearch: z.object({
    code: z.string(),
    state: z.string(),
  }),
  loaderDeps: ({ search: { code, state } }) => ({ code, state }),
  loader: async ({ deps: { code, state } }) => {
    try {
      const res = await api.post<ApiResponse<LoginRes>>(
        "/api/v1/auth/naver/login",
        {
          code,
          state,
        }
      );
      const { accessToken, signupStatus } = res.data.data!;

      useAuthStore.getState().setAccessToken(accessToken!);
      useSignupStore.getState().setIsSocialSignup(); // 불필요한 스탭 스킵 플래그

      switch (signupStatus) {
        case "PROFILE_INCOMPLETE":
          throw redirect({ to: "/onboarding/intro", replace: true });
        case "WITHDRAWN":
          // Todo: 회원탈퇴시 처리
          break;
        default: // COMPLETED
          throw redirect({ to: "/", replace: true });
      }
    } catch (err) {
      // 리다이렉트면 넘어가기
      if (isRedirect(err)) {
        throw err;
      }
      console.error("소셜 로그인 중 에러 발생", err);
    }
  },
});

function RouteComponent() {
  return null;
}
