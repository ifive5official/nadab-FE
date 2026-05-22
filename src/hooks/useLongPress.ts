// 일반 클릭 및 롱프레스 클릭 구분
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
