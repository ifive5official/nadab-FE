// 아래쪽에 뜨는 모달
// 선으로 버튼 구분
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

type Item = {
  label: string;
  onClick: () => void;
};

type Props = {
  isOpen: boolean;
  title?: string;
  items: Item[];
  onClose: () => void;
};

export default function BottomModal({ isOpen, title, items, onClose }: Props) {
  // 하단에서 올라오는 애니메이션으로 인한 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="z-2 absolute inset-0 bg-neutral-dark-50"
            onClick={onClose}
          />
          <motion.div
            className="z-3 absolute bottom-padding-y-m inset-x-padding-x-m sm:mx-auto sm:w-[412px] flex flex-col items-center bg-surface-base shadow-3 border border-border-base rounded-lg divide-y divide-interactive-border-default text-text-primary"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <p className="w-full text-center text-caption-m py-padding-y-m">
              {title}
            </p>
            {items.map((item) => {
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full text-button-1 py-padding-y-m"
                >
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("modal-root")!
  );
}
