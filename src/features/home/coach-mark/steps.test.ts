import { describe, expect, it } from "vitest";
import {
  HOME_COACH_MARK_STEP_IDS,
  HOME_COACH_MARK_TARGETS,
} from "./constants";
import { HOME_COACH_MARK_STEPS } from "./steps";

describe("HOME_COACH_MARK_STEPS", () => {
  const stepIds = new Set<string>(Object.values(HOME_COACH_MARK_STEP_IDS));
  const targetSelectors = new Set<string>(
    Object.values(HOME_COACH_MARK_TARGETS),
  );

  it("uses only declared step ids for every transition", () => {
    for (const step of HOME_COACH_MARK_STEPS) {
      expect(stepIds.has(step.id)).toBe(true);

      if (step.nextStepId) {
        expect(stepIds.has(step.nextStepId)).toBe(true);
      }

      if (step.targetNextStepId) {
        expect(stepIds.has(step.targetNextStepId)).toBe(true);
      }

      for (const button of step.buttons ?? []) {
        if (button.stepId) {
          expect(stepIds.has(button.stepId)).toBe(true);
        }
      }

      const cancelStepId = step.centerModalButtonActions?.cancelStepId;
      if (cancelStepId) {
        expect(stepIds.has(cancelStepId)).toBe(true);
      }
    }
  });

  it("uses only declared target selectors", () => {
    for (const step of HOME_COACH_MARK_STEPS) {
      if (step.target) {
        expect(targetSelectors.has(step.target)).toBe(true);
      }

      if (step.onLeaveAction?.target) {
        expect(targetSelectors.has(step.onLeaveAction.target)).toBe(true);
      }
    }
  });

  it("lets the final write step finish from either target interaction or modal button", () => {
    const writeStep = HOME_COACH_MARK_STEPS.find(
      (step) => step.id === HOME_COACH_MARK_STEP_IDS.step14WriteButton,
    );

    expect(writeStep).toMatchObject({
      allowTargetInteraction: true,
      targetAction: "next",
      buttons: [{ label: "넘어가기", action: "next", variant: "secondary" }],
    });
  });
});
