import { useEffect } from "react";
import type { CoachMarkStep } from "@/store/coachMarkTourStore";
import { CENTER_MODAL_SELECTOR } from "./constants";
import { runCenterModalAction, runStepLeaveAction } from "./actions";

type UseCenterModalButtonActionsParams = {
  currentStep?: CoachMarkStep;
  finish: () => void;
  goToStep: (stepId: string) => void;
  isOpen: boolean;
  next: () => void;
};

export function useCenterModalButtonActions({
  currentStep,
  finish,
  goToStep,
  isOpen,
  next,
}: UseCenterModalButtonActionsParams) {
  useEffect(() => {
    if (!isOpen || !currentStep?.centerModalButtonActions) return;

    const handleClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const centerModal = target.closest(CENTER_MODAL_SELECTOR);
      const button = target.closest("button");
      if (!centerModal || !button || !centerModal.contains(button)) return;

      const buttons = Array.from(centerModal.querySelectorAll("button"));
      const buttonIndex = buttons.indexOf(button);

      window.setTimeout(() => {
        runStepLeaveAction(currentStep);
        runCenterModalAction(currentStep, buttonIndex, {
          finish,
          goToStep,
          next,
        });
      }, 0);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [currentStep, finish, goToStep, isOpen, next]);
}
