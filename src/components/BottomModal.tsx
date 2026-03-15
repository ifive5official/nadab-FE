// 아래쪽에 뜨는 모달
// 선으로 버튼 구분
import useBottomModalStore from "@/store/bottomModalStore";
import { useLocation } from "@tanstack/react-router";
import clsx from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function BottomModal() {
  const { isOpen, closeBottomModal, config } = useBottomModalStore();
  const location = useLocation();
  // 하단에서 올라오는 애니메이션으로 인한 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    closeBottomModal();
  }, [location.pathname, closeBottomModal]);

  return createPortal(
    <AnimatePresence>
      {isOpen && config && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="z-20 absolute inset-0 bg-neutral-dark-50"
            onClick={closeBottomModal}
          />
          <motion.div
            className="z-30 absolute bottom-[calc(var(--spacing-padding-y-m)+var(--safe-bottom))] bottom-support-legacy inset-x-padding-x-m sm:mx-auto sm:w-[412px] flex flex-col items-center bg-surface-base dark:bg-surface-layer-2 shadow-3 border border-border-base rounded-lg divide-y divide-interactive-border-default dark:divide-field-border-hover text-text-primary"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <p className="w-full text-center text-caption-m py-padding-y-m">
              {config.title}
            </p>
            {config.items.map((item) => {
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full text-button-1 py-padding-y-m"
                >
                  <span
                    className={clsx(
                      item.type === "warning" &&
                        "text-feedback-error-fg underline",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("modal-root")!,
  );
}
