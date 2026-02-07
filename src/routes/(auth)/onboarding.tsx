import { useLocation, createFileRoute, Outlet } from "@tanstack/react-router";
import { GetCurrentStep, type StepId } from "@/features/auth/signupSteps";
import { getOrRefreshAccessToken } from "@/lib/axios";
import { redirect } from "@tanstack/react-router";
import Container from "@/components/Container";

export const Route = createFileRoute("/(auth)/onboarding")({
  component: OnboardingLayout,
  beforeLoad: async () => {
    // 회원가입 미완료 시 진입 금지
    const accessToken = await getOrRefreshAccessToken();
    if (!accessToken) {
      throw redirect({ to: "/signup/terms" });
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
    <div className="h-dvh w-full sm:w-[412px] sm:mx-auto flex flex-col">
      {currentStep.header}
      <Container hasHeader={!!currentStep.header}>
        <Outlet />
      </Container>
    </div>
  );
}
