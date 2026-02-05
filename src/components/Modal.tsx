import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import BlockButton from "./BlockButton";
import useModalStore from "@/store/modalStore";

export default function Modal() {
  const { isOpen, config } = useModalStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const Icon = config?.icon;

  return createPortal(
    <AnimatePresence>
      {isOpen && config && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="z-20 fixed inset-0 bg-neutral-dark-50"
            // onClick={onClose}
          />
          <motion.div
            className="z-30 fixed top-1/2 -translate-y-1/2 inset-x-padding-x-m sm:mx-auto sm:w-[412px] flex flex-col items-center bg-surface-base dark:bg-surface-layer-2 shadow-3 border border-border-base rounded-2xl text-text-primary px-padding-x-xl py-padding-y-xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="flex flex-col items-center gap-margin-y-s">
              {Icon && <Icon />}
              <p className="text-label-l whitespace-pre-line text-center">
                {config.title}
              </p>
              <p className="text-caption-m">{config.children}</p>
            </div>
            <div className="w-full flex gap-gap-x-s mt-gap-y-xl">
              {config.buttons.length === 1 && (
                <BlockButton onClick={config.buttons[0].onClick}>
                  {config.buttons[0].label}
                </BlockButton>
              )}
              {config.buttons.length === 2 && (
                <>
                  <BlockButton
                    variant="secondary"
                    onClick={config.buttons[0].onClick}
                  >
                    {config.buttons[0].label}
                  </BlockButton>
                  <BlockButton onClick={config.buttons[1].onClick}>
                    {config.buttons[1].label}
                  </BlockButton>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("modal-root")!,
  );
}
