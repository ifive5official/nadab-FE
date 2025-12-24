import { motion, AnimatePresence } from "motion/react";
// import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CloseBigIcon, ToastCircleCheckFilledIcon } from "./Icons";
import clsx from "clsx";

type Props = {
  isOpen: boolean;
  bottom?: string;
  message: string;
  onClose: () => void;
};

export default function Toast({ isOpen, bottom, message, onClose }: Props) {
  // useEffect(() => {
  //   if (isOpen) {
  //     document.body.style.overflow = "hidden";
  //   }

  //   return () => {
  //     document.body.style.overflow = "";
  //   };
  // }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="z-2 fixed inset-0" onClick={onClose} />
          <motion.div
            className={clsx(
              "fixed inset-x-padding-x-m sm:mx-auto sm:w-[412px]",
              bottom ?? "bottom-padding-y-m",
              "px-padding-x-xs py-padding-x-xs flex gap-gap-x-s items-center",
              "bg-surface-alpha-inverse border border-border-alpha-inverse rounded-full text-text-inverse-primary backdrop-blur-sm"
            )}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <ToastCircleCheckFilledIcon />
            <p className="mr-auto text-label-m">{message}</p>
            <button onClick={onClose}>
              <CloseBigIcon />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("modal-root")!
  );
}
