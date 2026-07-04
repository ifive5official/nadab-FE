import type { ReactNode } from "react";
import type { HomeCoachMarkButton, HomeCoachMarkStep } from "./types";

type NextButtonOptions = Omit<HomeCoachMarkButton, "action" | "label">;

export function nextButton(
  label: string,
  options?: NextButtonOptions,
): HomeCoachMarkButton {
  return { ...options, label, action: "next" };
}

export function goToStepButton(
  label: string,
  stepId: NonNullable<HomeCoachMarkButton["stepId"]>,
): HomeCoachMarkButton {
  return {
    label,
    action: "goToStep",
    stepId,
    variant: "secondary",
  };
}

type ConfirmTargetStepParams = Omit<
  HomeCoachMarkStep,
  "allowTargetInteraction" | "buttons" | "description"
> & {
  buttonLabel: string;
  description?: ReactNode;
};

export function confirmTargetStep({
  buttonLabel,
  ...step
}: ConfirmTargetStepParams): HomeCoachMarkStep {
  return {
    ...step,
    buttons: [nextButton(buttonLabel)],
    allowTargetInteraction: false,
  };
}

type EmptyButtonModalStepParams = Omit<HomeCoachMarkStep, "buttons">;

export function emptyButtonModalStep(
  step: EmptyButtonModalStepParams,
): HomeCoachMarkStep {
  return {
    ...step,
    buttons: [],
  };
}

type TargetClickStepParams = Omit<
  HomeCoachMarkStep,
  "allowTargetInteraction" | "buttons" | "highlightPadding" | "highlightPulse"
> & {
  button?: HomeCoachMarkButton;
};

export function targetClickStep({
  button,
  ...step
}: TargetClickStepParams): HomeCoachMarkStep {
  return {
    ...step,
    buttons: button ? [button] : [],
    allowTargetInteraction: true,
    highlightPadding: 0,
    highlightPulse: true,
  };
}
