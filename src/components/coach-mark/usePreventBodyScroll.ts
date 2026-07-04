import { useEffect } from "react";

export function usePreventBodyScroll(isEnabled: boolean) {
  useEffect(() => {
    if (!isEnabled) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isEnabled]);
}
