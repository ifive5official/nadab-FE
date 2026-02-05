// 온보딩 과정까지 다 마친 유저인지 추가 확인
import {
  createFileRoute,
  isRedirect,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import useAuthStore from "@/store/authStore";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/generated/api";
import type { CurrentUser } from "@/types/currentUser";
import useErrorStore from "@/store/modalStore";
import axios from "axios";
import type { components } from "@/generated/api-types";

type TokenRes = components["schemas"]["TokenResponse"];

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const { accessToken, setAccessToken } = useAuthStore.getState();
    if (!accessToken) {
      try {
        const res = await api.post<ApiResponse<TokenRes>>(
          "/api/v1/auth/refresh",
        );
        const newAccessToken = res.data.data?.accessToken ?? null;
        setAccessToken(newAccessToken!);
      } catch (err) {
        if (isRedirect(err)) throw err;
        throw redirect({ to: "/" });
      }
    }
    try {
      const user = await context.queryClient.ensureQueryData({
        queryKey: ["currentUser"],
        queryFn: async () => {
          const res =
            await api.get<ApiResponse<CurrentUser>>("/api/v1/user/me");
          return res.data.data!;
        },
      });
      if (!user.nickname) {
        // 온보딩 미완료 시 온보딩 진행
        throw redirect({ to: "/onboarding/intro" });
      }
    } catch (err: unknown) {
      if (isRedirect(err)) throw err;
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          // 관심 주제 없음(온보딩 미완료)
          throw redirect({ to: "/onboarding/intro" });
        }
        useErrorStore.getState().showError(
          // Todo: 에러 메시지 변경
          err.response?.data?.code ?? err.message,
          err.response?.data?.message ??
            "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요.",
        );
      }
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
