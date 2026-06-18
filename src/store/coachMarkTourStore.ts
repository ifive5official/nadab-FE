import type { ReactNode } from "react";
import { create } from "zustand";
import createSelectors from "./createSelectors";

export const COACH_MARK_MODAL_PLACEMENTS = {
  center: "center",
  upperCenter: "upper-center",
  aboveBottomModal: "above-bottom-modal",
  aboveCenterModal: "above-center-modal",
} as const;

export type CoachMarkModalPlacement =
  (typeof COACH_MARK_MODAL_PLACEMENTS)[keyof typeof COACH_MARK_MODAL_PLACEMENTS];

export type CoachMarkButton = {
  label: string;
  action: "next" | "finish" | "goToStep";
  stepId?: string;
  variant?: "primary" | "secondary" | "tertiary" | "white" | "disabled";
  className?: string;
};

export type CoachMarkLeaveAction = {
  type: "click";
  target: string;
};

export type CoachMarkStep = {
  id: string;
  target?: string;
  title: string;
  description?: ReactNode;
  onLeaveAction?: CoachMarkLeaveAction;
  buttons?: CoachMarkButton[];
  buttonLabel?: string;
  nextStepId?: string;
  onButton?: "next" | "finish";
  targetAction?: "next" | "finish";
  targetNextStepId?: string;
  allowTargetInteraction?: boolean;
  modalPlacement?: CoachMarkModalPlacement;
  highlightPadding?: number;
  highlightPulse?: boolean;
  allowBottomModalInteraction?: boolean;
  allowCenterModalInteraction?: boolean;
  centerModalButtonActions?: {
    cancel?: "next" | "finish";
    confirm?: "next" | "finish";
  };
};

type State = {
  isOpen: boolean;
  tourId: string | null;
  steps: CoachMarkStep[];
  currentStepId: string | null;
};

type Action = {
  startTour: (tourId: string, steps: CoachMarkStep[]) => void;
  startTourOnce: (tourId: string, steps: CoachMarkStep[]) => void;
  goToStep: (stepId: string) => void;
  next: () => void;
  finish: () => void;
  close: () => void;
  isCompleted: (tourId: string) => boolean;
};

const getCompletedKey = (tourId: string) => `coachmark:${tourId}:completed`;

const canUseLocalStorage = () => typeof window !== "undefined";

const markCompleted = (tourId: string | null) => {
  if (!tourId || !canUseLocalStorage()) return;
  window.localStorage.setItem(getCompletedKey(tourId), "true");
};

const useCoachMarkTourStoreBase = create<State & Action>((set, get) => ({
  isOpen: false,
  tourId: null,
  steps: [],
  currentStepId: null,
  startTour: (tourId, steps) =>
    set({
      isOpen: steps.length > 0,
      tourId,
      steps,
      currentStepId: steps[0]?.id ?? null,
    }),
  startTourOnce: (tourId, steps) => {
    const state = get();
    if (state.isOpen && state.tourId === tourId) return;
    if (state.isCompleted(tourId)) return;
    get().startTour(tourId, steps);
  },
  goToStep: (stepId) => {
    const hasStep = get().steps.some((step) => step.id === stepId);
    if (!hasStep) return;
    set({ isOpen: true, currentStepId: stepId });
  },
  next: () => {
    const { currentStepId, steps } = get();
    const currentIndex = steps.findIndex((step) => step.id === currentStepId);
    const nextStep = steps[currentIndex + 1];
    if (nextStep) {
      set({ currentStepId: nextStep.id });
      return;
    }
    get().finish();
  },
  finish: () => {
    markCompleted(get().tourId);
    set({ isOpen: false, tourId: null, steps: [], currentStepId: null });
  },
  close: () =>
    set({ isOpen: false, tourId: null, steps: [], currentStepId: null }),
  isCompleted: (tourId) => {
    if (!canUseLocalStorage()) return false;
    return window.localStorage.getItem(getCompletedKey(tourId)) === "true";
  },
}));

const useCoachMarkTourStore = createSelectors(useCoachMarkTourStoreBase);

export default useCoachMarkTourStore;
