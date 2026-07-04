import { useEffect, useState } from "react";
import type { CoachMarkModalPlacement } from "@/store/coachMarkTourStore";
import {
  ANCHOR_MODAL_MEASURE_DURATION,
  MODAL_BOTTOM_GAP,
} from "./constants";
import type { AnchorModalPosition } from "./types";

type UseAnchorModalPositionParams = {
  activePlacement: CoachMarkModalPlacement;
  isOpen: boolean;
  placement?: CoachMarkModalPlacement;
  selector: string;
  stepId?: string;
};

export function useAnchorModalPosition({
  activePlacement,
  isOpen,
  placement,
  selector,
  stepId,
}: UseAnchorModalPositionParams) {
  const [position, setPosition] = useState<AnchorModalPosition | null>(null);

  useEffect(() => {
    if (!isOpen || !stepId || placement !== activePlacement) {
      return;
    }

    let frameId = 0;
    let retryId: number | undefined;
    const startedAt = performance.now();

    const measureAnchorModal = () => {
      const modal = document.querySelector(selector);

      if (!modal) {
        retryId = window.setTimeout(measureAnchorModal, 50);
        return;
      }

      const rect = modal.getBoundingClientRect();
      setPosition({
        stepId,
        offset: window.innerHeight - rect.top + MODAL_BOTTOM_GAP,
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          radius: 8,
        },
      });

      if (performance.now() - startedAt < ANCHOR_MODAL_MEASURE_DURATION) {
        frameId = requestAnimationFrame(measureAnchorModal);
      }
    };

    const requestMeasure = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measureAnchorModal);
    };

    requestMeasure();
    window.addEventListener("resize", requestMeasure);
    window.addEventListener("scroll", requestMeasure, true);

    return () => {
      cancelAnimationFrame(frameId);
      if (retryId) window.clearTimeout(retryId);
      window.removeEventListener("resize", requestMeasure);
      window.removeEventListener("scroll", requestMeasure, true);
    };
  }, [activePlacement, isOpen, placement, selector, stepId]);

  return position;
}
