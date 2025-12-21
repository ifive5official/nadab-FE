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
import useErrorStore from "@/store/errorStore";
import axios from "axios";

export const Route = createFileRoute("/_main")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) {
      throw redirect({ to: "/" });
    }
    try {
      const user = await context.queryClient.ensureQueryData({
        queryKey: ["currentUser"],
        queryFn: async () => {
          const res = await api.get<ApiResponse<CurrentUser>>(
            "/api/v1/user/me"
          );
          return res.data.data!;
        },
      });
      if (!user.nickname || !user.interestCode) {
        // 온보딩 미완료 시 온보딩 진행
        throw redirect({ to: "/onboarding/intro" });
      }
      return {
        currentUser: user,
      };
    } catch (err: unknown) {
      if (isRedirect(err)) throw err;
      if (axios.isAxiosError(err)) {
        useErrorStore.getState().showError(
          // Todo: 에러 메시지 변경
          err.message,
          err.response?.data?.message ??
            "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요."
        );
      }
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
