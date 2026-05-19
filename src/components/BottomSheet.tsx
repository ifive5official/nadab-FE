// 아래에서 열리는 창
// 좋아요 및 댓글 목록 보기에서 사용
import useBottomSheetStore from "@/store/bottomSheetStore";
import { useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function BottomSheet() {
  const { isOpen, config, closeBottomSheet } = useBottomSheetStore();
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
    closeBottomSheet();
  }, [location.pathname, closeBottomSheet]);

  return createPortal(
    <AnimatePresence>
      {isOpen && config && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="z-20 absolute inset-0 bg-neutral-dark-50"
            onClick={closeBottomSheet}
          />
          <motion.div
            className="z-30 absolute bottom-0 inset-x-0 pt-padding-y-m h-[calc((732/796)*100*var(--dvh))] pb-(--safe-bottom) sm:mx-auto sm:w-[412px] bg-surface-base dark:bg-surface-layer-2 rounded-t-3xl flex flex-col items-center"
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="w-10 h-[5px] rounded-[20px] bg-[#D9D9D9]" />
            <p className="py-padding-y-s text-label-l">{config.title}</p>
            <div className="overflow-y-auto py-padding-y-m">
              {config.content}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("modal-root")!,
  );
}
