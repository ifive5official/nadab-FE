import { useLocation, createFileRoute, Outlet } from "@tanstack/react-router";
import { GetCurrentStep, type StepId } from "@/features/auth/signupSteps";

export const Route = createFileRoute("/(auth)/onboarding")({
  component: OnboardingLayout,
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
    <div className="h-[calc(100dvh-var(--spacing-padding-y-m))] flex flex-col">
      {currentStep.header}
      <Outlet />
    </div>
  );
}
