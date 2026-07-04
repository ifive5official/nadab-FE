import type { CSSProperties } from "react";
import {
  COACH_MARK_MODAL_PLACEMENTS,
  type CoachMarkModalPlacement,
} from "@/store/coachMarkTourStore";
import { VIEWPORT_PADDING } from "./constants";
import type { Rect } from "./types";

function parseRadius(value: string, size: number) {
  if (value.endsWith("%")) {
    return (Number.parseFloat(value) / 100) * size;
  }

  return Number.parseFloat(value) || 0;
}

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

export function getClampedRect(target: Element, padding: number): Rect {
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

export function getModalStyle(
  placement: CoachMarkModalPlacement,
  anchorBottomOffset?: number,
): CSSProperties {
  if (
    placement === COACH_MARK_MODAL_PLACEMENTS.aboveBottomModal ||
    placement === COACH_MARK_MODAL_PLACEMENTS.aboveCenterModal
  ) {
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
