// 온보딩 과정까지 다 마친 유저인지 추가 확인
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import useAuthStore from "@/store/authStore";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/generated/api";
import type { CurrentUser } from "@/types/currentUser";

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
      return {
        currentUser: user,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // 온보딩 미완료 시 온보딩 진행
      throw redirect({ to: "/onboarding/intro" });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
