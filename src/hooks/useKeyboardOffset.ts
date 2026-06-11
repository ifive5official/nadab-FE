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
    if (!isNative) return;

    // 키보드가 나타날 때: 실제 키보드 높이를 받아서 설정
    const showListener = Keyboard.addListener("keyboardWillShow", (info) => {
      setIsVisible(true);
      setBottomOffset(info.keyboardHeight);
    });

    // 키보드가 사라질 때: 높이 초기화
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
