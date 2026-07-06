import { useEffect, useState } from "react";
import { getClampedRect } from "./geometry";
import type { HighlightRect } from "./types";

type UseHighlightRectParams = {
  isOpen: boolean;
  stepId?: string;
  targetSelector?: string;
  highlightPadding: number;
};

export function useHighlightRect({
  isOpen,
  stepId,
  targetSelector,
  highlightPadding,
}: UseHighlightRectParams) {
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen || !stepId) {
      return;
    }

    const measuredStepId = stepId;
    let frameId = 0;
    let retryId: number | undefined;
    let observedTarget: Element | null = null;
    let resizeObserver: ResizeObserver | undefined;
    let mutationObserver: MutationObserver | undefined;

    const requestMeasure = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measure);
    };

    const observeTarget = (target: Element) => {
      if (observedTarget === target) return;

      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      observedTarget = target;

      resizeObserver = new ResizeObserver(requestMeasure);
      resizeObserver.observe(target);

      mutationObserver = new MutationObserver(requestMeasure);
      mutationObserver.observe(target, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    };

    const resetTargetObservation = () => {
      setHighlightRect(null);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      observedTarget = null;
    };

    function measure() {
      if (!targetSelector) {
        resetTargetObservation();
        return;
      }

      const target = document.querySelector(targetSelector);
      if (!target) {
        resetTargetObservation();
        retryId = window.setTimeout(measure, 100);
        return;
      }

      observeTarget(target);
      setHighlightRect({
        ...getClampedRect(target, highlightPadding),
        stepId: measuredStepId,
      });
    }

    requestMeasure();
    window.addEventListener("resize", requestMeasure);
    window.addEventListener("scroll", requestMeasure, true);

    return () => {
      cancelAnimationFrame(frameId);
      if (retryId) window.clearTimeout(retryId);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener("resize", requestMeasure);
      window.removeEventListener("scroll", requestMeasure, true);
    };
  }, [highlightPadding, isOpen, stepId, targetSelector]);

  return highlightRect;
}
