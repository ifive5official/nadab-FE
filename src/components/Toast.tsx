/**
 * @description 페이지 하단에 뜨는 닫을 수 있는 반투명한 토스트
 * @note 전역에 컴포넌트를 하나 두고 zustand store로 내용 및 열림 상태를 관리
 * 현재는 수동으로 닫아야 닫히는데, 3초 정도 지나면 자동으로 닫히게 하는 게 더 나을 것 같다는 생각이 듦.
 *
 */

import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { CloseBigIcon, ToastCircleCheckFilledIcon } from "./Icons";
import clsx from "clsx";
import useToastStore from "@/store/toastStore";
import { useLocation } from "@tanstack/react-router";
import { useEffect } from "react";

export default function Toast() {
  const { isOpen, config, closeToast } = useToastStore();
  const location = useLocation();

  // 경로 변경 시 자동으로 닫힘
  useEffect(() => {
    closeToast();
  }, [location.pathname, closeToast]);

  return createPortal(
    <AnimatePresence>
      {isOpen && config && (
        <>
          <div className="z-20 fixed inset-0" onClick={closeToast} />
          <motion.div
            className={clsx(
              "fixed z-21 inset-x-padding-x-m bottom-(--safe-bottom) sm:mx-auto sm:w-[412px]",
              config.bottom ??
                "bottom-[calc(var(--spacing-padding-y-m)+var(--safe-bottom))] bottom-support-legacy",
              "px-padding-x-xs py-padding-x-xs flex gap-gap-x-s items-center",
              "bg-surface-alpha-inverse border border-border-alpha-inverse rounded-full text-text-inverse-primary backdrop-blur-sm",
            )}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <ToastCircleCheckFilledIcon />
            <p className="mr-auto text-label-m">{config.message}</p>
            <button onClick={closeToast}>
              <CloseBigIcon />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("toast-root")!,
  );
}
