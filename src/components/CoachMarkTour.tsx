import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import clsx from "clsx";
import BlockButton from "./BlockButton";
import useCoachMarkTourStore, {
  type CoachMarkButton,
} from "@/store/coachMarkTourStore";

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const VIEWPORT_PADDING = 16;
const DEFAULT_HIGHLIGHT_PADDING = 8;
const MODAL_BOTTOM_GAP = 16;
const BOTTOM_MODAL_MEASURE_DURATION = 450;
const BOTTOM_MODAL_SELECTOR = '[data-coachmark="bottom-topic-modal"]';
const DEFAULT_HIGHLIGHT_RADIUS = 12;
const CENTER_MODAL_SELECTOR = '#modal-root [class*="z-50"][class*="top-1/2"]';

function getClampedRect(target: Element, padding: number): Rect {
  const rect = target.getBoundingClientRect();
  const top = Math.max(0, rect.top - padding);
  const left = Math.max(0, rect.left - padding);
  const right = Math.min(window.innerWidth, rect.right + padding);
  const bottom = Math.min(window.innerHeight, rect.bottom + padding);

  return {
    top,
    left,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

function getModalStyle(
  placement: "center" | "above-bottom-modal" | "above-center-modal",
  anchorBottomOffset?: number,
) {
  if (placement === "above-bottom-modal") {
    return {
      left: "50%",
      width: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
      maxWidth: 380,
      bottom: `${anchorBottomOffset}px`,
      transform: "translateX(-50%)",
    };
  }

  if (placement === "above-center-modal") {
    return {
      left: "50%",
      width: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
      maxWidth: 380,
      bottom: `${anchorBottomOffset}px`,
      transform: "translateX(-50%)",
    };
  }

  return {
    left: "50%",
    width: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
    maxWidth: 380,
    top: "50%",
    transform: "translate(-50%, -50%)",
  };
}

export default function CoachMarkTour() {
  const rawMaskId = useId();
  const maskId = `coachmark-mask-${rawMaskId.replace(/:/g, "")}`;
  const { isOpen, steps, currentStepId, goToStep, next, finish } =
    useCoachMarkTourStore();
  const currentStep = steps.find((step) => step.id === currentStepId);
  const [highlightRect, setHighlightRect] = useState<Rect | null>(null);
  const [bottomModalPosition, setBottomModalPosition] = useState<{
    stepId: string;
    offset: number;
    rect: Rect;
  } | null>(null);
  const [centerModalPosition, setCenterModalPosition] = useState<{
    stepId: string;
    offset: number;
    rect: Rect;
  } | null>(null);

  const targetSelector = currentStep?.target;
  const highlightPadding =
    currentStep?.highlightPadding ?? DEFAULT_HIGHLIGHT_PADDING;
  const highlightRadius =
    currentStep?.highlightRadius ?? DEFAULT_HIGHLIGHT_RADIUS;

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !currentStep) {
      return;
    }

    let frameId = 0;
    let retryId: number | undefined;
    let observedTarget: Element | null = null;
    let resizeObserver: ResizeObserver | undefined;
    let mutationObserver: MutationObserver | undefined;

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

    const measure = () => {
      if (!targetSelector) {
        setHighlightRect(null);
        resizeObserver?.disconnect();
        mutationObserver?.disconnect();
        observedTarget = null;
        return;
      }

      const target = document.querySelector(targetSelector);
      if (!target) {
        setHighlightRect(null);
        resizeObserver?.disconnect();
        mutationObserver?.disconnect();
        observedTarget = null;
        retryId = window.setTimeout(measure, 100);
        return;
      }

      observeTarget(target);
      setHighlightRect(getClampedRect(target, highlightPadding));
    };

    const requestMeasure = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measure);
    };

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
  }, [currentStep, highlightPadding, isOpen, targetSelector]);

  useEffect(() => {
    if (!isOpen || currentStep?.modalPlacement !== "above-bottom-modal") {
      return;
    }

    let frameId = 0;
    let retryId: number | undefined;
    const startedAt = performance.now();

    const measureBottomModal = () => {
      const bottomModal = document.querySelector(BOTTOM_MODAL_SELECTOR);

      if (!bottomModal) {
        retryId = window.setTimeout(measureBottomModal, 50);
        return;
      }

      const rect = bottomModal.getBoundingClientRect();
      setBottomModalPosition({
        stepId: currentStep.id,
        offset: window.innerHeight - rect.top + MODAL_BOTTOM_GAP,
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
      });

      if (performance.now() - startedAt < BOTTOM_MODAL_MEASURE_DURATION) {
        frameId = requestAnimationFrame(measureBottomModal);
      }
    };

    const requestMeasure = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measureBottomModal);
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
  }, [currentStep?.id, currentStep?.modalPlacement, isOpen]);

  useEffect(() => {
    if (!isOpen || currentStep?.modalPlacement !== "above-center-modal") {
      return;
    }

    let frameId = 0;
    let retryId: number | undefined;
    const startedAt = performance.now();

    const measureCenterModal = () => {
      const centerModal = document.querySelector(CENTER_MODAL_SELECTOR);

      if (!centerModal) {
        retryId = window.setTimeout(measureCenterModal, 50);
        return;
      }

      const rect = centerModal.getBoundingClientRect();
      setCenterModalPosition({
        stepId: currentStep.id,
        offset: window.innerHeight - rect.top + MODAL_BOTTOM_GAP,
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
      });

      if (performance.now() - startedAt < BOTTOM_MODAL_MEASURE_DURATION) {
        frameId = requestAnimationFrame(measureCenterModal);
      }
    };

    const requestMeasure = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measureCenterModal);
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
  }, [currentStep?.id, currentStep?.modalPlacement, isOpen]);

  useEffect(() => {
    if (!isOpen || !currentStep?.targetNextStepId || !targetSelector) return;

    const handleClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest(targetSelector)) return;

      window.setTimeout(() => {
        goToStep(currentStep.targetNextStepId!);
      }, 0);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [currentStep?.targetNextStepId, goToStep, isOpen, targetSelector]);

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
      const action =
        buttonIndex === 0
          ? currentStep.centerModalButtonActions?.cancel
          : currentStep.centerModalButtonActions?.confirm;

      if (!action) return;

      window.setTimeout(() => {
        if (action === "next") {
          next();
          return;
        }

        finish();
      }, 0);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [currentStep, finish, isOpen, next]);

  const bottomModalOffset =
    bottomModalPosition && bottomModalPosition.stepId === currentStep?.id
      ? bottomModalPosition.offset
      : undefined;
  const bottomModalRect =
    bottomModalPosition && bottomModalPosition.stepId === currentStep?.id
      ? bottomModalPosition.rect
      : undefined;
  const isWaitingForBottomModal =
    currentStep?.modalPlacement === "above-bottom-modal" &&
    bottomModalOffset === undefined;
  const centerModalOffset =
    centerModalPosition && centerModalPosition.stepId === currentStep?.id
      ? centerModalPosition.offset
      : undefined;
  const centerModalRect =
    centerModalPosition && centerModalPosition.stepId === currentStep?.id
      ? centerModalPosition.rect
      : undefined;
  const isWaitingForCenterModal =
    currentStep?.modalPlacement === "above-center-modal" &&
    centerModalOffset === undefined;
  const modalAnchorOffset = bottomModalOffset ?? centerModalOffset;
  const modalStyle = useMemo(
    () =>
      getModalStyle(
        currentStep?.modalPlacement ?? "center",
        modalAnchorOffset,
      ),
    [modalAnchorOffset, currentStep?.modalPlacement],
  );

  if (!currentStep) return null;

  const fallbackButton: CoachMarkButton = {
    label: currentStep.buttonLabel ?? "다음",
    action: currentStep.onButton === "finish" ? "finish" : "next",
    stepId: currentStep.nextStepId,
  };
  const buttons = (currentStep.buttons ?? [fallbackButton]).slice(0, 2);

  const handleButtonClick = (button: CoachMarkButton) => {
    if (button.action === "finish") {
      finish();
      return;
    }

    if (button.action === "goToStep" && button.stepId) {
      goToStep(button.stepId);
      return;
    }

    if (button.stepId) {
      goToStep(button.stepId);
      return;
    }

    next();
  };

  const hasHighlight = Boolean(highlightRect);
  const canInteractWithBottomModal =
    Boolean(currentStep.allowBottomModalInteraction) && Boolean(bottomModalRect);
  const canInteractWithCenterModal =
    Boolean(currentStep.allowCenterModalInteraction) && Boolean(centerModalRect);
  const interactiveModalRect = canInteractWithBottomModal
    ? bottomModalRect
    : canInteractWithCenterModal
      ? centerModalRect
      : undefined;
  const interactiveModalMaskId = canInteractWithBottomModal
    ? `${maskId}-bottom-modal`
    : `${maskId}-center-modal`;
  const isWaitingForAnchorModal =
    isWaitingForBottomModal || isWaitingForCenterModal;

  return createPortal(
    <>
      {isOpen && (
        <>
          {hasHighlight && highlightRect ? (
            <>
              <svg className="pointer-events-none fixed inset-0 z-[55] h-full w-full">
                <defs>
                  <mask id={maskId}>
                    <rect width="100%" height="100%" fill="white" />
                    <rect
                      x={highlightRect.left}
                      y={highlightRect.top}
                      width={highlightRect.width}
                      height={highlightRect.height}
                      rx={highlightRadius}
                      ry={highlightRadius}
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  className="fill-neutral-dark-50"
                  mask={`url(#${maskId})`}
                />
              </svg>
              <div
                className="fixed z-[56]"
                style={{
                  top: 0,
                  left: 0,
                  right: 0,
                  height: highlightRect.top,
                }}
              />
              <div
                className="fixed z-[56]"
                style={{
                  top: highlightRect.top + highlightRect.height,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <div
                className="fixed z-[56]"
                style={{
                  top: highlightRect.top,
                  left: 0,
                  width: highlightRect.left,
                  height: highlightRect.height,
                }}
              />
              <div
                className="fixed z-[56]"
                style={{
                  top: highlightRect.top,
                  left: highlightRect.left + highlightRect.width,
                  right: 0,
                  height: highlightRect.height,
                }}
              />
              {!currentStep.allowTargetInteraction && (
                <div
                  className="fixed z-[56]"
                  style={{
                    top: highlightRect.top,
                    left: highlightRect.left,
                    width: highlightRect.width,
                    height: highlightRect.height,
                  }}
                />
              )}
              {currentStep.highlightPulse && (
                <motion.div
                  className="pointer-events-none fixed z-[57] border-2 border-brand-primary"
                  style={{
                    top: highlightRect.top,
                    left: highlightRect.left,
                    width: highlightRect.width,
                    height: highlightRect.height,
                    borderRadius: highlightRadius,
                  }}
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{
                    opacity: [0.9, 0],
                    scale: [1, 1.12],
                  }}
                  transition={{
                    duration: 1.2,
                    ease: "easeOut",
                    repeat: Infinity,
                    repeatDelay: 0.2,
                  }}
                />
              )}
            </>
          ) : (
            <>
              {interactiveModalRect && (
                <>
                  <svg className="pointer-events-none fixed inset-0 z-[55] h-full w-full">
                    <defs>
                      <mask id={interactiveModalMaskId}>
                        <rect width="100%" height="100%" fill="white" />
                        <rect
                          x={interactiveModalRect.left}
                          y={interactiveModalRect.top}
                          width={interactiveModalRect.width}
                          height={interactiveModalRect.height}
                          rx="8"
                          ry="8"
                          fill="black"
                        />
                      </mask>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      className="fill-neutral-dark-50"
                      mask={`url(#${interactiveModalMaskId})`}
                    />
                  </svg>
                  <div
                    className="fixed z-[56]"
                    style={{
                      top: 0,
                      left: 0,
                      right: 0,
                      height: interactiveModalRect.top,
                    }}
                  />
                  <div
                    className="fixed z-[56]"
                    style={{
                      top: interactiveModalRect.top,
                      left: 0,
                      width: interactiveModalRect.left,
                      height: interactiveModalRect.height,
                    }}
                  />
                  <div
                    className="fixed z-[56]"
                    style={{
                      top: interactiveModalRect.top,
                      left: interactiveModalRect.left + interactiveModalRect.width,
                      right: 0,
                      height: interactiveModalRect.height,
                    }}
                  />
                  <div
                    className="fixed z-[56]"
                    style={{
                      top: interactiveModalRect.top + interactiveModalRect.height,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                </>
              )}
              {!interactiveModalRect && (
                <div className="fixed inset-0 bg-neutral-dark-50 z-[55]" />
              )}
            </>
          )}

          {!isWaitingForAnchorModal && (
            <div className="fixed z-[60]" style={modalStyle}>
              <div className="flex flex-col items-center bg-surface-base dark:bg-surface-layer-2 shadow-3 border border-border-base rounded-2xl text-brand-primary px-padding-x-xl py-padding-y-xl">
                <div className="flex flex-col items-center gap-margin-y-s text-center">
                  <p className="text-label-l whitespace-pre-line">
                    {currentStep.title}
                  </p>
                  {currentStep.description && (
                    <p className="text-caption-m text-text-secondary whitespace-pre-line">
                      {currentStep.description}
                    </p>
                  )}
                </div>
                {buttons.length > 0 && (
                  <div
                    className={clsx(
                      "w-full mt-gap-y-xl",
                      buttons.length === 2 && "flex gap-gap-x-s",
                    )}
                  >
                    {buttons.map((button, index) => (
                      <BlockButton
                        key={`${button.label}-${index}`}
                        variant={
                          button.variant ??
                          (buttons.length === 2 && index === 0
                            ? "secondary"
                            : "primary")
                        }
                        className={button.className}
                        onClick={() => handleButtonClick(button)}
                      >
                        {button.label}
                      </BlockButton>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>,
    document.getElementById("modal-root")!,
  );
}
