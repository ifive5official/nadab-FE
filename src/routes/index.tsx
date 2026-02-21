import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { LandingPage } from "@/features/LandingPage";
import Home from "@/features/home/Home";
import useAuthStore from "@/store/authStore";
import { api, getOrRefreshAccessToken } from "@/lib/axios";
import type { ApiResponse } from "@/generated/api";
import type { CurrentUser } from "@/types/currentUser";
import axios from "axios";
import { questionOptions } from "@/features/question/queries";
import { homeOptions } from "@/features/home/queries";
import { handleDefaultApiError } from "@/lib/handleDefaultError";
import type { components } from "@/generated/api-types";

type ConsentRes = components["schemas"]["TermsCheckResponse"];

export const Route = createFileRoute("/")({
  // 로그인 여부에 따른 홈/온보딩 분기 로직 + 리프레시
  beforeLoad: async ({ context }) => {
    const accessToken = await getOrRefreshAccessToken();
    console.log("index beforeLoad", accessToken);
    if (accessToken) {
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
            const consentRes = await api.get<ApiResponse<ConsentRes>>(
              "/api/v1/terms/consent",
            );
            const consentData = consentRes.data?.data;
            if (consentData?.requiresConsent) {
              // 가입은 되어 있는데 약관 동의 안 했으면(소셜 로그인)
              throw redirect({
                to: "/signup/terms",
                search: { type: "social" },
              });
            } else {
              throw redirect({ to: "/onboarding/intro" });
            }
          } else {
            handleDefaultApiError(err);
          }
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
