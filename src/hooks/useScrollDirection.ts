import { useEffect, useState, useRef, type RefObject } from "react";

// targetRef는 HTMLDivElement를 가리키는 React RefObject이거나 null일 수 있도록 타입을 정의합니다.
export function useScrollDirection(
  targetRef?: RefObject<HTMLDivElement | null>,
): boolean {
  // 위에서 아래로 스크롤(드래그) 중인지 여부
  const [isScrollingDown, setIsScrollingDown] = useState<boolean>(false);

  // 터치 시작 지점의 Y 좌표를 기록할 Ref
  const touchStartY = useRef<number>(0);

  // 감지 최소 거리 (픽셀 단위)
  const MIN_SWIPE_DISTANCE = 10;

  useEffect(() => {
    // targetRef가 제공되면 해당 div 요소를, 없으면 window를 이벤트 타겟으로 설정합니다.
    const element: HTMLDivElement | Window = targetRef?.current || window;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === 0) return;

      const touchCurrentY = e.touches[0].clientY;
      const distance = touchCurrentY - touchStartY.current;

      if (Math.abs(distance) > MIN_SWIPE_DISTANCE) {
        if (distance > 0) {
          setIsScrollingDown(true);
        } else {
          setIsScrollingDown(false);
        }

        // 실시간 방향 전환을 위해 현재 좌표를 시작 좌표로 갱신
        // touchStartY.current = touchCurrentY;
      }
    };

    const handleTouchEnd = () => {
      touchStartY.current = 0;
    };

    // 이벤트 리스너 등록 (타입스크립트 호환을 위해 EventListener 변환 처리)
    element.addEventListener("touchstart", handleTouchStart as EventListener, {
      passive: true,
    });
    element.addEventListener("touchmove", handleTouchMove as EventListener, {
      passive: true,
    });
    element.addEventListener("touchend", handleTouchEnd as EventListener);

    // 정리(Clean-up) 함수
    return () => {
      element.removeEventListener(
        "touchstart",
        handleTouchStart as EventListener,
      );
      element.removeEventListener(
        "touchmove",
        handleTouchMove as EventListener,
      );
      element.removeEventListener("touchend", handleTouchEnd as EventListener);
    };
  }, [targetRef]);

  return isScrollingDown;
}
