import type {
  CoachMarkButton,
  CoachMarkStep,
} from "@/store/coachMarkTourStore";
import type { HOME_COACH_MARK_STEP_IDS } from "./constants";

export type HomeCoachMarkStepId =
  (typeof HOME_COACH_MARK_STEP_IDS)[keyof typeof HOME_COACH_MARK_STEP_IDS];

export type HomeCoachMarkButton = Omit<CoachMarkButton, "stepId"> & {
  stepId?: HomeCoachMarkStepId;
};

type HomeCenterModalButtonActions = Omit<
  NonNullable<CoachMarkStep["centerModalButtonActions"]>,
  "cancelStepId"
> & {
  cancelStepId?: HomeCoachMarkStepId;
};

export type HomeCoachMarkStep = Omit<
  CoachMarkStep,
  | "buttons"
  | "centerModalButtonActions"
  | "id"
  | "nextStepId"
  | "targetNextStepId"
> & {
  id: HomeCoachMarkStepId;
  nextStepId?: HomeCoachMarkStepId;
  targetNextStepId?: HomeCoachMarkStepId;
  buttons?: HomeCoachMarkButton[];
  centerModalButtonActions?: HomeCenterModalButtonActions;
};
