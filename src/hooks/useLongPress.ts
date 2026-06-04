/**
 * @description 일반 클릭과 롱프레스 클릭을 구분하는 커스텀 훅
 * @page 피드에서 좋아요 및 댓글 버튼에서 사용
 * @note
 */
import { useRef, type PointerEvent } from "react";

type LongPressEvent = PointerEvent<HTMLButtonElement>;

export function useLongPress(
  onLongPress: (e: LongPressEvent) => void,
  onClick?: (e: LongPressEvent) => void,
  delay = 500,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPressedRef = useRef(false);
  const isLongPressedRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = (e: LongPressEvent) => {
    isPressedRef.current = true;
    isLongPressedRef.current = false;

    clearTimer();

    timerRef.current = setTimeout(() => {
      if (!isPressedRef.current) return;

      isLongPressedRef.current = true;
      onLongPress(e);
    }, delay);
  };

  const stop = (e: LongPressEvent) => {
    if (!isPressedRef.current) return;

    clearTimer();

    if (!isLongPressedRef.current && onClick) {
      onClick(e);
    }

    isPressedRef.current = false;
    isLongPressedRef.current = false;
  };

  const cancel = () => {
    clearTimer();
    isPressedRef.current = false;
    isLongPressedRef.current = false;
  };

  return {
    onPointerDown: start,
    onPointerUp: stop,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
  };
}
