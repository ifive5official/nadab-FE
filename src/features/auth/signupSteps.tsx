import { SubHeader, ProgressHeader } from "@/components/Headers";

export const signupSteps = [
  {
    id: "terms",
    path: "/signup/terms",
    header: <SubHeader showMenuButton={false}>약관 동의</SubHeader>,
  },
  {
    id: "email",
    path: "/signup/email",
    header: <SubHeader showMenuButton={false}>본인인증</SubHeader>,
  },
  {
    id: "emailVerification",
    path: "/signup/emailVerification",
    header: <SubHeader showMenuButton={false}>인증번호 확인</SubHeader>,
  },
  {
    id: "password",
    path: "/signup/password",
    header: <SubHeader showMenuButton={false}>비밀번호 설정</SubHeader>,
  },
  {
    id: "intro",
    path: "/onboarding/intro",
    header: null,
  },
  {
    id: "category",
    path: "/onboarding/category",
    header: <ProgressHeader progress={50} />,
  },
  {
    id: "profile",
    path: "/onboarding/profile",
    header: <ProgressHeader progress={100} />,
  },
] as const;

export type StepId = (typeof signupSteps)[number]["id"];

export function GetCurrentStep(currentStepId: StepId) {
  const currentStepIdx = signupSteps.findIndex(
    (step) => step.id === currentStepId
  );
  return signupSteps[currentStepIdx];
}

export function getNextStepPath(currentStepId: StepId) {
  const currentStepIdx = signupSteps.findIndex(
    (step) => step.id === currentStepId
  );
  const nextStepPath =
    currentStepIdx === signupSteps.length - 1
      ? "/"
      : signupSteps[currentStepIdx + 1].path;
  return nextStepPath;
}
