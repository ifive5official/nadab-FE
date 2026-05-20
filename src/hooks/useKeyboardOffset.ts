// 키보드 위에 붙는 ui 위해 사용
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
