// Todo: 나중에 필요없음 지우자
export const resetPasswordSteps = [
  {
    id: "forgot",
    path: "/password/forgot",
  },
  {
    id: "verify",
    path: "/password/verify",
  },
  {
    id: "reset",
    path: "/password/reset",
  },
] as const;

export type StepId = (typeof resetPasswordSteps)[number]["id"];

export function GetCurrentStep(currentStepId: StepId) {
  const currentStepIdx = resetPasswordSteps.findIndex(
    (step) => step.id === currentStepId
  );
  return resetPasswordSteps[currentStepIdx];
}

export function getNextStepPath(currentStepId: StepId) {
  const currentStepIdx = resetPasswordSteps.findIndex(
    (step) => step.id === currentStepId
  );
  const nextStepPath =
    currentStepIdx === resetPasswordSteps.length - 1
      ? "/login"
      : resetPasswordSteps[currentStepIdx + 1].path;
  return nextStepPath;
}
