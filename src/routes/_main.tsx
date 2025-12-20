// 인증 체크
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import useAuthStore from "@/store/authStore";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";
import type { ApiResponse } from "@/generated/api";

type Res = components["schemas"]["UserProfileResponse"];

export const Route = createFileRoute("/_main")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) {
      throw redirect({ to: "/" });
    }
    try {
      const data = await context.queryClient.ensureQueryData({
        queryKey: ["currentUser"],
        queryFn: async () => {
          const res = await api.get<ApiResponse<Res>>("/api/v1/user/me");
          return res.data;
        },
      });
      console.log(data);
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
