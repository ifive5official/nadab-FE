/**
 * @description 전역 코치마크 투어 컴포넌트
 * @page 홈 온보딩 코치마크에서 사용
 * @note target 하이라이트, 바텀/중앙 모달과의 상호작용, step 이동을 zustand store로 관리
 */
import { useId, useMemo } from "react";
import { createPortal } from "react-dom";
import useCoachMarkTourStore, {
  COACH_MARK_MODAL_PLACEMENTS,
  type CoachMarkButton,
} from "@/store/coachMarkTourStore";
import {
  getCoachMarkButtons,
  runButtonAction,
  runStepLeaveAction,
  runTargetAction,
} from "./coach-mark/actions";
import { CoachMarkContentModal } from "./coach-mark/CoachMarkContentModal";
import {
  BOTTOM_MODAL_SELECTOR,
  CENTER_MODAL_SELECTOR,
  DEFAULT_HIGHLIGHT_PADDING,
} from "./coach-mark/constants";
import { DimLayer } from "./coach-mark/DimLayer";
import { getModalStyle } from "./coach-mark/geometry";
import { TargetHighlightLayer } from "./coach-mark/TargetHighlightLayer";
import { useAnchorModalPosition } from "./coach-mark/useAnchorModalPosition";
import { useCenterModalButtonActions } from "./coach-mark/useCenterModalButtonActions";
import { useHighlightRect } from "./coach-mark/useHighlightRect";
import { usePreventBodyScroll } from "./coach-mark/usePreventBodyScroll";

export default function CoachMarkTour() {
  const rawMaskId = useId();
  const maskId = `coachmark-mask-${rawMaskId.replace(/:/g, "")}`;
  const { isOpen, steps, currentStepId, goToStep, next, finish } =
    useCoachMarkTourStore();
  const currentStep = steps.find((step) => step.id === currentStepId);
  const stepId = currentStep?.id;
  const targetSelector = currentStep?.target;
  const highlightPadding =
    currentStep?.highlightPadding ?? DEFAULT_HIGHLIGHT_PADDING;

  usePreventBodyScroll(isOpen);

  const highlightRect = useHighlightRect({
    isOpen,
    stepId,
    targetSelector,
    highlightPadding,
  });
  const bottomModalPosition = useAnchorModalPosition({
    activePlacement: COACH_MARK_MODAL_PLACEMENTS.aboveBottomModal,
    isOpen,
    placement: currentStep?.modalPlacement,
    selector: BOTTOM_MODAL_SELECTOR,
    stepId,
  });
  const centerModalPosition = useAnchorModalPosition({
    activePlacement: COACH_MARK_MODAL_PLACEMENTS.aboveCenterModal,
    isOpen,
    placement: currentStep?.modalPlacement,
    selector: CENTER_MODAL_SELECTOR,
    stepId,
  });

  useCenterModalButtonActions({
    currentStep,
    finish,
    goToStep,
    isOpen,
    next,
  });

  const bottomModalOffset =
    bottomModalPosition && bottomModalPosition.stepId === stepId
      ? bottomModalPosition.offset
      : undefined;
  const bottomModalRect =
    bottomModalPosition && bottomModalPosition.stepId === stepId
      ? bottomModalPosition.rect
      : undefined;
  const centerModalOffset =
    centerModalPosition && centerModalPosition.stepId === stepId
      ? centerModalPosition.offset
      : undefined;
  const centerModalRect =
    centerModalPosition && centerModalPosition.stepId === stepId
      ? centerModalPosition.rect
      : undefined;
  const isWaitingForBottomModal =
    currentStep?.modalPlacement ===
      COACH_MARK_MODAL_PLACEMENTS.aboveBottomModal &&
    bottomModalOffset === undefined;
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
    [currentStep?.modalPlacement, modalAnchorOffset],
  );

  if (!currentStep) return null;

  const buttons = getCoachMarkButtons(currentStep);
  const activeHighlightRect =
    highlightRect?.stepId === currentStep.id ? highlightRect : null;
  const canInteractWithBottomModal =
    Boolean(currentStep.allowBottomModalInteraction) &&
    Boolean(bottomModalRect);
  const canInteractWithCenterModal =
    Boolean(currentStep.allowCenterModalInteraction) &&
    Boolean(centerModalRect);
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

  const handleButtonClick = (button: CoachMarkButton) => {
    runStepLeaveAction(currentStep);
    runButtonAction(button, { finish, goToStep, next });
  };

  const handleTargetClick = () => {
    if (!targetSelector) return;

    const target = document.querySelector(targetSelector);
    if (target instanceof HTMLElement) {
      target.click();
    }

    window.setTimeout(() => {
      runStepLeaveAction(currentStep);
      runTargetAction(currentStep, { finish, goToStep, next });
    }, 0);
  };

  return createPortal(
    <>
      {isOpen && (
        <>
          {activeHighlightRect ? (
            <TargetHighlightLayer
              highlightRect={activeHighlightRect}
              maskId={maskId}
              onTargetClick={handleTargetClick}
              step={currentStep}
            />
          ) : (
            <DimLayer
              interactiveModalMaskId={interactiveModalMaskId}
              interactiveModalRect={interactiveModalRect}
            />
          )}
          {!isWaitingForAnchorModal && (
            <CoachMarkContentModal
              buttons={buttons}
              modalStyle={modalStyle}
              onButtonClick={handleButtonClick}
              step={currentStep}
            />
          )}
        </>
      )}
    </>,
    document.getElementById("modal-root")!,
  );
}
