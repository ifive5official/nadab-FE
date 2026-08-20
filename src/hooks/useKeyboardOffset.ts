/**
 * @description 키보드 위에 붙는 ui(엑세서리 바)의 높이를 맞추기 위해 사용
 * @page 현재는 답변 시에만 사용
 */

import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

export function useKeyboardOffset() {
  const isNative = Capacitor.isNativePlatform();
  const [bottomOffset, setBottomOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(!isNative);
  const keyboardHeightRef = useRef(0);
  const layoutViewportHeightRef = useRef(window.innerHeight);

  useEffect(() => {
    const updateFromViewport = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;

      const viewportBottom = viewport.height + viewport.offsetTop;
      const viewportOcclusion = Math.max(
        0,
        layoutViewportHeightRef.current - viewportBottom,
      );
      const nativeFallback = Math.max(
        0,
        keyboardHeightRef.current - viewport.offsetTop,
      );
      const offset = Math.max(viewportOcclusion, nativeFallback);
      const isKeyboardOpen =
        offset > 50 || keyboardHeightRef.current > 0;

      setIsVisible(isKeyboardOpen);
      setBottomOffset(offset);
    };

    window.visualViewport?.addEventListener("resize", updateFromViewport);
    window.visualViewport?.addEventListener("scroll", updateFromViewport);

    if (!isNative) {
      updateFromViewport();
      return () => {
        window.visualViewport?.removeEventListener(
          "resize",
          updateFromViewport,
        );
        window.visualViewport?.removeEventListener(
          "scroll",
          updateFromViewport,
        );
      };
    }

    // 네이티브 키보드 높이는 Visual Viewport가 변하지 않을 때 보정값으로 사용합니다.
    const showListener = Keyboard.addListener("keyboardWillShow", (info) => {
      keyboardHeightRef.current = info.keyboardHeight;
      setIsVisible(true);
      updateFromViewport();

      if (Capacitor.getPlatform() === "ios") {
        Keyboard.setAccessoryBarVisible({ isVisible: false }).catch(() => {});
      }
    });

    const hideListener = Keyboard.addListener("keyboardWillHide", () => {
      keyboardHeightRef.current = 0;
      layoutViewportHeightRef.current = window.innerHeight;
      setIsVisible(false);
      setBottomOffset(0);
    });

    return () => {
      window.visualViewport?.removeEventListener("resize", updateFromViewport);
      window.visualViewport?.removeEventListener("scroll", updateFromViewport);
      showListener.then((l) => l.remove());
      hideListener.then((l) => l.remove());
    };
  }, [isNative]);

  return { isVisible, bottomOffset };
}
