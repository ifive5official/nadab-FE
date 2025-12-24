import { useLocation, createFileRoute, Outlet } from "@tanstack/react-router";
import { GetCurrentStep, type StepId } from "@/features/auth/signupSteps";
import useAuthStore from "@/store/authStore";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { redirect } from "@tanstack/react-router";

type TokenRes = components["schemas"]["TokenResponse"];

export const Route = createFileRoute("/(auth)/onboarding")({
  component: OnboardingLayout,
  beforeLoad: async () => {
    // 회원가입 미완료 시 진입 금지
    const { accessToken, setAccessToken } = useAuthStore.getState();
    if (!accessToken) {
      try {
        const res = await api.post<ApiResponse<TokenRes>>(
          "/api/v1/auth/refresh"
        );
        const newAccessToken = res.data.data?.accessToken ?? null;
        setAccessToken(newAccessToken!);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        throw redirect({ to: "/signup/terms" });
      }
    }
  },
});

function OnboardingLayout() {
  const location = useLocation();
  const path = location.pathname.split("/onboarding/")[1] as StepId;
  const currentStep = GetCurrentStep(path);

  // /으로 넘어가기 전에 잠시 에러 뜨는 문제 때문에 넣어둠
  // 빼지 말 것
  if (!currentStep) {
    return null;
  }

  return (
    // 주제 선택 스크롤 동작 때문에 높이 설정함
    // Todo: 더 좋은 방법이 없나...
    <div className="h-[calc(100svh-var(--spacing-padding-y-m)-var(--spacing-header-height))] flex flex-col">
      {currentStep.header}
      <Outlet />
    </div>
  );
}
