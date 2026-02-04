import { api } from "@/lib/axios";
import { createFileRoute, isRedirect } from "@tanstack/react-router";
import { z } from "zod";
import { redirect } from "@tanstack/react-router";
import useAuthStore from "@/store/authStore";
import type { components } from "@/generated/api-types";
import type { ApiResponse } from "@/generated/api";
import axios from "axios";
import useErrorStore from "@/store/modalStore";

type LoginRes = components["schemas"]["TokenResponse"];

export const Route = createFileRoute("/(auth)/auth/$provider/callback")({
  component: RouteComponent,
  validateSearch: z.object({
    code: z.string(),
    state: z.string(),
  }),
  loaderDeps: ({ search: { code, state } }) => ({ code, state }),
  loader: async ({ deps: { code, state }, params: { provider } }) => {
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
      if (
        axios.isAxiosError(err) &&
        err.response?.data?.code ===
          "AUTH_EMAIL_ALREADY_REGISTERED_WITH_DIFFERENT_METHOD"
      ) {
        // 이미 일반 로그인으로 가입한 계정일 시
        useErrorStore
          .getState()
          .showError("이미 가입한 계정이에요.", "다른 계정으로 가입해보세요.");
      } else if (axios.isAxiosError(err)) {
        useErrorStore
          .getState()
          .showError(
            err.response?.data?.code ?? err.message,
            err.response?.data?.message ??
              "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요.",
          );
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
