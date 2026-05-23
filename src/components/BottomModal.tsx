// 아래쪽에 뜨는 모달
// 선으로 버튼 구분
import useBottomModalStore from "@/store/bottomModalStore";
import { useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import ListModal from "./ListModal";

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
          <ListModal
            className="bottom-[calc(var(--spacing-padding-y-m)+var(--safe-bottom))] bottom-support-legacy inset-x-padding-x-m"
            title={config.title}
            items={config.items}
            animationVariants={{
              initial: { y: 100, opacity: 0 },
              animate: { y: 0, opacity: 1 },
              exit: { y: 100, opacity: 0 },
            }}
          />
        </>
      )}
    </AnimatePresence>,
    document.getElementById("modal-root")!,
  );
}
