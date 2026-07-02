import type {
  CoachMarkButton,
  CoachMarkStep,
} from "@/store/coachMarkTourStore";

type TourActionHandlers = {
  finish: () => void;
  goToStep: (stepId: string) => void;
  next: () => void;
};

export function getCoachMarkButtons(step: CoachMarkStep): CoachMarkButton[] {
  const fallbackButton: CoachMarkButton = {
    label: step.buttonLabel ?? "다음",
    action: step.onButton === "finish" ? "finish" : "next",
    stepId: step.nextStepId,
  };

  return (step.buttons ?? [fallbackButton]).slice(0, 2);
}

export function runStepLeaveAction(step?: CoachMarkStep) {
  const action = step?.onLeaveAction;
  if (!action) return;

  const target = document.querySelector(action.target);
  if (target instanceof HTMLElement) {
    target.click();
  }
}

export function runButtonAction(
  button: CoachMarkButton,
  handlers: TourActionHandlers,
) {
  if (button.action === "finish") {
    handlers.finish();
    return;
  }

  if (button.action === "goToStep" && button.stepId) {
    handlers.goToStep(button.stepId);
    return;
  }

  if (button.stepId) {
    handlers.goToStep(button.stepId);
    return;
  }

  handlers.next();
}

export function runTargetAction(
  step: CoachMarkStep,
  handlers: TourActionHandlers,
) {
  if (step.targetNextStepId) {
    handlers.goToStep(step.targetNextStepId);
    return;
  }

  if (step.targetAction === "finish") {
    handlers.finish();
    return;
  }

  handlers.next();
}

export function runCenterModalAction(
  step: CoachMarkStep,
  buttonIndex: number,
  handlers: TourActionHandlers,
) {
  const action =
    buttonIndex === 0
      ? step.centerModalButtonActions?.cancel
      : step.centerModalButtonActions?.confirm;

  if (!action) return;

  if (action === "next") {
    handlers.next();
    return;
  }

  if (action === "goToStep") {
    const stepId = step.centerModalButtonActions?.cancelStepId;
    if (stepId) handlers.goToStep(stepId);
    return;
  }

  handlers.finish();
}
