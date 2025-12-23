import { useLocation, createFileRoute, Outlet } from "@tanstack/react-router";
import { GetCurrentStep, type StepId } from "@/features/auth/signupSteps";
import useAuthStore from "@/store/authStore";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/signup")({
  component: SignupLayout,
  beforeLoad: async ({ location }) => {
    // 소셜 로그인 시 토큰 있는 상태로 약관 보여줘야 해서 예외처리
    if (location.pathname !== "/terms") {
      // 로그인 시 진입 불가
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        throw redirect({ to: "/" });
      }
    }
  },
});

function SignupLayout() {
  const location = useLocation();
  const path = location.pathname.split("/signup/")[1] as StepId;
  const currentStep = GetCurrentStep(path);

  // /onboarding으로 넘어가기 전에 잠시 에러 뜨는 문제 때문에 넣어둠
  // 빼지 말 것
  if (!currentStep) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {currentStep.header}
      <Outlet />
    </div>
  );
}
