import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import BlockButton from "./BlockButton";

type Props = {
  isOpen: boolean;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  children?: React.ReactNode; // 콘텐츠
  buttons: Button[];
  onClose?: () => void;
};

type Button = {
  label: string;
  onClick: () => void;
};

export default function Modal({
  isOpen,
  icon: Icon,
  title,
  children,
  buttons,
}: // onClose,
Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
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
            className="absolute inset-0 bg-neutral-dark-50"
            // onClick={onClose}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 inset-x-padding-x-m sm:mx-auto sm:w-[412px] flex flex-col items-center bg-surface-base shadow-3 border border-border-base rounded-2xl text-text-primary px-padding-x-xl py-padding-y-xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="flex flex-col items-center gap-margin-y-s">
              <Icon />
              <p className="text-label-l">{title}</p>
              <p className="text-caption-m">{children}</p>
            </div>
            <div className="w-full flex gap-gap-x-s mt-gap-y-xl">
              {buttons.length === 1 && (
                <BlockButton onClick={buttons[0].onClick}>
                  {buttons[0].label}
                </BlockButton>
              )}
              {buttons.length === 2 && (
                <>
                  <BlockButton variant="tertiary" onClick={buttons[0].onClick}>
                    {buttons[0].label}
                  </BlockButton>
                  <BlockButton onClick={buttons[1].onClick}>
                    {buttons[1].label}
                  </BlockButton>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("modal-root")!
  );
}
