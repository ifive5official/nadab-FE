import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { LandingPage } from "@/features/LandingPage";
import Home from "@/features/home/Home";
import useAuthStore from "@/store/authStore";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/generated/api";
import type { CurrentUser } from "@/types/currentUser";
import axios from "axios";
import type { components } from "@/generated/api-types";
import { questionOptions } from "@/features/question/queries";
import { homeOptions } from "@/features/home/queries";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type TokenRes = components["schemas"]["TokenResponse"];

export const Route = createFileRoute("/")({
  // Todo: 중복 코드 제거
  // 로그인 여부에 따른 홈/온보딩 분기 로직 + 리프레시
  beforeLoad: async ({ context }) => {
    const { accessToken, setAccessToken } = useAuthStore.getState();
    let currentToken = accessToken;
    if (!accessToken) {
      try {
        const res = await api.post<ApiResponse<TokenRes>>(
          "/api/v1/auth/refresh",
        );
        const newAccessToken = res.data.data?.accessToken ?? null;
        setAccessToken(newAccessToken!);
        currentToken = newAccessToken;
        // // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // 아무 처리 안 함
        console.log(err);
      }
    }
    if (currentToken) {
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
    }
  },
  // 로그인 시 홈에서 필요한 데이터 가져옴
  // Todo: 에러 처리
  loader: ({ context: { queryClient } }) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      return Promise.all([
        queryClient.ensureQueryData(questionOptions),
        queryClient.ensureQueryData(homeOptions),
      ]);
    }
  },
  component: () => {
    const accessToken = useAuthStore.use.accessToken();
    if (!accessToken) {
      return <LandingPage />;
    }
    return <Home />;
  },
});
