// 온보딩 과정까지 다 마친 유저인지 추가 확인
import {
  createFileRoute,
  isRedirect,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { api, getOrRefreshAccessToken } from "@/lib/axios";
import type { ApiResponse } from "@/generated/api";
import type { CurrentUser } from "@/types/currentUser";
import axios from "axios";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const accessToken = await getOrRefreshAccessToken();
    if (!accessToken) {
      throw redirect({ to: "/" });
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
        handleDefaultApiError(err);
      }
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
