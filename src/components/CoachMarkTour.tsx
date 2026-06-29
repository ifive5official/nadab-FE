/**
 * @description 전역 코치마크 투어 컴포넌트
 * @page 홈 온보딩 코치마크에서 사용
 * @note target 하이라이트, 바텀/중앙 모달과의 상호작용, step 이동을 zustand store로 관리
 */
import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import clsx from "clsx";
import BlockButton from "./BlockButton";
import useCoachMarkTourStore, {
  COACH_MARK_MODAL_PLACEMENTS,
  type CoachMarkButton,
  type CoachMarkStep,
  type CoachMarkModalPlacement,
} from "@/store/coachMarkTourStore";

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
  radius: number;
};

type HighlightRect = Rect & {
  stepId: string;
};

const VIEWPORT_PADDING = 16;
const DEFAULT_HIGHLIGHT_PADDING = 8;
const MODAL_BOTTOM_GAP = 16;
const BOTTOM_MODAL_MEASURE_DURATION = 450;
const BOTTOM_MODAL_SELECTOR = '[data-coachmark="bottom-topic-modal"]';
const CENTER_MODAL_SELECTOR = '#modal-root [class*="z-50"][class*="top-1/2"]';

// CSS border-radius를 SVG mask의 rx/ry로 옮기기 위한 파서
function parseRadius(value: string, size: number) {
  if (value.endsWith("%")) {
    return (Number.parseFloat(value) / 100) * size;
  }

  return Number.parseFloat(value) || 0;
}

// pill 버튼처럼 radius가 큰 요소도 실제 rect 안에 맞게 잘라낸다.
function getElementRadius(target: Element, width: number, height: number) {
  const style = window.getComputedStyle(target);
  const radius = Math.max(
    parseRadius(style.borderTopLeftRadius, Math.min(width, height)),
    parseRadius(style.borderTopRightRadius, Math.min(width, height)),
    parseRadius(style.borderBottomRightRadius, Math.min(width, height)),
    parseRadius(style.borderBottomLeftRadius, Math.min(width, height)),
  );

  return Math.min(radius, width / 2, height / 2);
}

// target 요소의 현재 화면상 위치와 cutout radius를 함께 계산한다.
function getClampedRect(target: Element, padding: number): Rect {
  const rect = target.getBoundingClientRect();
  const top = Math.max(0, rect.top - padding);
  const left = Math.max(0, rect.left - padding);
  const right = Math.min(window.innerWidth, rect.right + padding);
  const bottom = Math.min(window.innerHeight, rect.bottom + padding);
  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);

  return {
    top,
    left,
    width,
    height,
    radius: Math.min(
      getElementRadius(target, rect.width, rect.height) + padding,
      width / 2,
      height / 2,
    ),
  };
}

// 코치마크 모달은 placement에 따라 화면 중앙 또는 다른 모달 위에 고정한다.
function getModalStyle(
  placement: CoachMarkModalPlacement,
  anchorBottomOffset?: number,
) {
  if (placement === COACH_MARK_MODAL_PLACEMENTS.aboveBottomModal) {
    return {
      left: "50%",
      width: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
      maxWidth: 380,
      bottom: `${anchorBottomOffset}px`,
      transform: "translateX(-50%)",
    };
  }

  if (placement === COACH_MARK_MODAL_PLACEMENTS.aboveCenterModal) {
    return {
      left: "50%",
      width: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
      maxWidth: 380,
      bottom: `${anchorBottomOffset}px`,
      transform: "translateX(-50%)",
    };
  }

  if (placement === COACH_MARK_MODAL_PLACEMENTS.upperCenter) {
    return {
      left: "50%",
      width: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
      maxWidth: 380,
      top: "15%",
      transform: "translate(-50%, -50%)",
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

// step을 떠나는 순간 기존 UI의 click 동작을 그대로 재사용한다.
function runStepLeaveAction(step?: CoachMarkStep) {
  const action = step?.onLeaveAction;
  if (!action) return;

  const target = document.querySelector(action.target);
  if (target instanceof HTMLElement) {
    target.click();
  }
}

export default function CoachMarkTour() {
  const rawMaskId = useId();
  const maskId = `coachmark-mask-${rawMaskId.replace(/:/g, "")}`;
  const { isOpen, steps, currentStepId, goToStep, next, finish } =
    useCoachMarkTourStore();
  const currentStep = steps.find((step) => step.id === currentStepId);
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(
    null,
  );
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

  // 코치마크가 떠 있는 동안 배경 스크롤을 막는다.
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

  // target 위치는 텍스트/API 변경으로 늦게 바뀔 수 있어 resize/mutation까지 관찰한다.
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
      setHighlightRect({
        ...getClampedRect(target, highlightPadding),
        stepId: currentStep.id,
      });
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

  // BottomModal은 올라오는 애니메이션 중 위치가 변하므로 짧게 반복 측정한다.
  useEffect(() => {
    if (
      !isOpen ||
      currentStep?.modalPlacement !==
        COACH_MARK_MODAL_PLACEMENTS.aboveBottomModal
    ) {
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
          radius: 8,
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

  // 전역 중앙 Modal도 애니메이션 후 위치가 안정되므로 BottomModal과 같은 방식으로 측정한다.
  useEffect(() => {
    if (
      !isOpen ||
      currentStep?.modalPlacement !==
        COACH_MARK_MODAL_PLACEMENTS.aboveCenterModal
    ) {
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
          radius: 8,
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

  // 전역 중앙 Modal의 버튼 클릭 결과에 따라 코치마크도 함께 이동/종료한다.
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
        runStepLeaveAction(currentStep);

        if (action === "next") {
          next();
          return;
        }

        if (action === "goToStep") {
          const stepId = currentStep.centerModalButtonActions?.cancelStepId;
          if (stepId) goToStep(stepId);
          return;
        }

        finish();
      }, 0);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [currentStep, finish, goToStep, isOpen, next]);

  const bottomModalOffset =
    bottomModalPosition && bottomModalPosition.stepId === currentStep?.id
      ? bottomModalPosition.offset
      : undefined;
  const bottomModalRect =
    bottomModalPosition && bottomModalPosition.stepId === currentStep?.id
      ? bottomModalPosition.rect
      : undefined;
  const isWaitingForBottomModal =
    currentStep?.modalPlacement ===
      COACH_MARK_MODAL_PLACEMENTS.aboveBottomModal &&
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
    currentStep?.modalPlacement ===
      COACH_MARK_MODAL_PLACEMENTS.aboveCenterModal &&
    centerModalOffset === undefined;
  const modalAnchorOffset = bottomModalOffset ?? centerModalOffset;
  const modalStyle = useMemo(
    () =>
      getModalStyle(
        currentStep?.modalPlacement ?? COACH_MARK_MODAL_PLACEMENTS.center,
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

  const runCurrentStepLeaveAction = () => {
    runStepLeaveAction(currentStep);
  };

  const handleButtonClick = (button: CoachMarkButton) => {
    runCurrentStepLeaveAction();

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

  const moveByTargetAction = () => {
    runCurrentStepLeaveAction();

    if (currentStep.targetNextStepId) {
      goToStep(currentStep.targetNextStepId);
      return;
    }

    if (currentStep.targetAction === "finish") {
      finish();
      return;
    }

    next();
  };

  const handleTargetClick = () => {
    if (!targetSelector) return;

    const target = document.querySelector(targetSelector);
    if (target instanceof HTMLElement) {
      target.click();
    }

    window.setTimeout(moveByTargetAction, 0);
  };

  const activeHighlightRect =
    highlightRect?.stepId === currentStep.id ? highlightRect : null;
  const hasHighlight = Boolean(activeHighlightRect);
  const canInteractWithBottomModal =
    Boolean(currentStep.allowBottomModalInteraction) &&
    Boolean(bottomModalRect);
  const canInteractWithCenterModal =
    Boolean(currentStep.allowCenterModalInteraction) &&
    Boolean(centerModalRect);
  // 상호작용을 허용한 모달 영역은 dim overlay에서 구멍을 뚫고 터치를 통과시킨다.
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
          {/* target 하이라이트가 있는 step: SVG mask로 둥근 cutout을 만든다. */}
          {hasHighlight && activeHighlightRect ? (
            <>
              <svg className="pointer-events-none fixed inset-0 z-[55] h-full w-full">
                <defs>
                  <mask id={maskId}>
                    <rect width="100%" height="100%" fill="white" />
                    <rect
                      x={activeHighlightRect.left}
                      y={activeHighlightRect.top}
                      width={activeHighlightRect.width}
                      height={activeHighlightRect.height}
                      rx={activeHighlightRect.radius}
                      ry={activeHighlightRect.radius}
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
                  height: activeHighlightRect.top,
                }}
              />
              <div
                className="fixed z-[56]"
                style={{
                  top: activeHighlightRect.top + activeHighlightRect.height,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <div
                className="fixed z-[56]"
                style={{
                  top: activeHighlightRect.top,
                  left: 0,
                  width: activeHighlightRect.left,
                  height: activeHighlightRect.height,
                }}
              />
              <div
                className="fixed z-[56]"
                style={{
                  top: activeHighlightRect.top,
                  left: activeHighlightRect.left + activeHighlightRect.width,
                  right: 0,
                  height: activeHighlightRect.height,
                }}
              />
              {!currentStep.allowTargetInteraction && (
                <div
                  className="fixed z-[56]"
                  style={{
                    top: activeHighlightRect.top,
                    left: activeHighlightRect.left,
                    width: activeHighlightRect.width,
                    height: activeHighlightRect.height,
                  }}
                />
              )}
              {currentStep.allowTargetInteraction &&
                (currentStep.targetNextStepId || currentStep.targetAction) && (
                  <button
                    type="button"
                    aria-label={currentStep.title}
                    className="fixed z-[58] cursor-pointer bg-transparent p-0"
                    style={{
                      top: activeHighlightRect.top,
                      left: activeHighlightRect.left,
                      width: activeHighlightRect.width,
                      height: activeHighlightRect.height,
                      borderRadius: activeHighlightRect.radius,
                    }}
                    onClick={handleTargetClick}
                  />
                )}
              {currentStep.highlightPulse && (
                <motion.div
                  className="pointer-events-none fixed z-[57] border-2 border-brand-primary"
                  style={{
                    top: activeHighlightRect.top,
                    left: activeHighlightRect.left,
                    width: activeHighlightRect.width,
                    height: activeHighlightRect.height,
                    borderRadius: activeHighlightRect.radius,
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
              {/* target이 없는 step: 상호작용 가능한 모달이 있으면 그 영역만 밝게 둔다. */}
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
                      left:
                        interactiveModalRect.left + interactiveModalRect.width,
                      right: 0,
                      height: interactiveModalRect.height,
                    }}
                  />
                  <div
                    className="fixed z-[56]"
                    style={{
                      top:
                        interactiveModalRect.top + interactiveModalRect.height,
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

          {/* anchor 모달 위치가 필요한 step은 측정이 끝난 뒤 코치마크 모달을 렌더링한다. */}
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
                        key={`${currentStep.id}-${button.label}-${index}`}
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
