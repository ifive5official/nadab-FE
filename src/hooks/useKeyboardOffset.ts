/**
 * @description 키보드 위에 붙는 ui(엑세서리 바)의 높이를 맞추기 위해 사용
 * @page 현재는 답변 시에만 사용
 * @note 동작이 매끄럽지 않아서 개선 필요
 */

import { useEffect, useState } from "react";

export function useKeyboardOffset() {
  const [bottomOffset, setBottomOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleViewportChange = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;

      const offset =
        window.innerHeight - (viewport.height + viewport.offsetTop);

      const keyboardOpen = window.innerHeight - viewport.height > 100;

      setIsVisible(keyboardOpen);
      setBottomOffset(Math.max(0, offset));
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
      window.visualViewport.addEventListener("scroll", handleViewportChange);
      handleViewportChange();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportChange,
        );
        window.visualViewport.removeEventListener(
          "scroll",
          handleViewportChange,
        );
      }
    };
  }, []);

  return { isVisible, bottomOffset };
}
