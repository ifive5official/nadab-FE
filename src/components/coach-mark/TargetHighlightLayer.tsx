import { motion } from "motion/react";
import type { CoachMarkStep } from "@/store/coachMarkTourStore";
import { CutoutOverlay } from "./CutoutOverlay";
import type { HighlightRect } from "./types";

type TargetHighlightLayerProps = {
  highlightRect: HighlightRect;
  maskId: string;
  onTargetClick: () => void;
  step: CoachMarkStep;
};

export function TargetHighlightLayer({
  highlightRect,
  maskId,
  onTargetClick,
  step,
}: TargetHighlightLayerProps) {
  return (
    <>
      <CutoutOverlay
        blockCutout={!step.allowTargetInteraction}
        lightenCutout={step.lightenCutout}
        maskId={maskId}
        rect={highlightRect}
      />
      {step.allowTargetInteraction &&
        (step.targetNextStepId || step.targetAction) && (
          <button
            type="button"
            aria-label={step.title}
            className="fixed z-[58] cursor-pointer bg-transparent p-0"
            style={{
              top: highlightRect.top,
              left: highlightRect.left,
              width: highlightRect.width,
              height: highlightRect.height,
              borderRadius: highlightRect.radius,
            }}
            onClick={onTargetClick}
          />
        )}
      {step.highlightPulse && (
        <motion.div
          className="pointer-events-none fixed z-[57] border-2 border-brand-primary"
          style={{
            top: highlightRect.top,
            left: highlightRect.left,
            width: highlightRect.width,
            height: highlightRect.height,
            borderRadius: highlightRect.radius,
          }}
          initial={{ scale: 1 }}
          animate={{
            scale: [1, 1.05],
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            repeat: Infinity,
          }}
        />
      )}
    </>
  );
}
