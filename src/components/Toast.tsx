import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { CloseBigIcon, ToastCircleCheckFilledIcon } from "./Icons";
import clsx from "clsx";
import useToastStore from "@/store/toastStore";

export default function Toast() {
  const { isOpen, config, closeToast } = useToastStore();

  return createPortal(
    <AnimatePresence>
      {isOpen && config && (
        <>
          <div className="z-20 fixed inset-0" onClick={closeToast} />
          <motion.div
            className={clsx(
              "fixed inset-x-padding-x-m sm:mx-auto sm:w-[412px]",
              config.bottom ?? "bottom-padding-y-m",
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
