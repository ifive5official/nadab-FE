// 일반 클릭 및 롱프레스 클릭 구분
import { useState, useRef, type MouseEvent, type TouchEvent } from "react";

type LongPressEvent =
  | MouseEvent<HTMLButtonElement>
  | TouchEvent<HTMLButtonElement>;

export function useLongPress(
  onLongPress: (e: LongPressEvent) => void,
  onClick?: (e: LongPressEvent) => void,
) {
  const [isLongPressActive, setIsLongPressActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = (e: LongPressEvent) => {
    // 이벤트 버블링이나 기본 동작 방지 (필요 시)
    // e.preventDefault();

    setIsLongPressActive(false);

    // 0.5초(delay) 후에 롱 프레스 함수 실행
    timerRef.current = setTimeout(() => {
      onLongPress(e);
      setIsLongPressActive(true); // 롱 프레스가 발동되었음을 기록
    }, 500);
  };

  const stop = (e: LongPressEvent) => {
    // 손을 떼거나 마우스가 벗어나면 타이머를 취소
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 롱 프레스가 발동되지 않은 상태에서 마우스를 뗀 거라면 일반 클릭으로 간주
    if (!isLongPressActive && onClick) {
      onClick(e);
    }

    setIsLongPressActive(false);
  };

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: stop,
    onTouchEnd: stop,
    onMouseLeave: stop, // 버튼 밖으로 마우스가 나가면 취소
  };
}
