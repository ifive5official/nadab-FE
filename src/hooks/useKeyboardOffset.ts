/**
 * @description 키보드 위에 붙는 ui(엑세서리 바)의 높이를 맞추기 위해 사용
 * @page 현재는 답변 시에만 사용
 */

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

export function useKeyboardOffset() {
  const isNative = Capacitor.isNativePlatform();
  const [bottomOffset, setBottomOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(!isNative);

  useEffect(() => {
    if (!isNative) {
      // 웹 환경: visualViewport를 사용하여 키보드(혹은 가상 키보드) 대응
      const handleViewportChange = () => {
        if (!window.visualViewport) return;
        const viewport = window.visualViewport;
        const offset = window.innerHeight - (viewport.height + viewport.offsetTop);
        const isKeyboardOpen = window.innerHeight - viewport.height > 50;
        
        setIsVisible(isKeyboardOpen);
        setBottomOffset(Math.max(0, offset));
      };

      window.visualViewport?.addEventListener("resize", handleViewportChange);
      return () => window.visualViewport?.removeEventListener("resize", handleViewportChange);
    }

    // 네이티브 환경: 실제 키보드 높이를 가져와서 오프셋으로 사용
    const showListener = Keyboard.addListener("keyboardWillShow", (info) => {
      setIsVisible(true);
      setBottomOffset(info.keyboardHeight); 
      
      if (Capacitor.getPlatform() === "ios") {
        Keyboard.setAccessoryBarVisible({ isVisible: false }).catch(() => {});
      }
    });

    const hideListener = Keyboard.addListener("keyboardWillHide", () => {
      setIsVisible(false);
      setBottomOffset(0);
    });

    return () => {
      showListener.then((l) => l.remove());
      hideListener.then((l) => l.remove());
    };
  }, [isNative]);

  return { isVisible, bottomOffset };
}
