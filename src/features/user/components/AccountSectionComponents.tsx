import { AccordionIcon } from "@/components/Icons";
import clsx from "clsx";
import { motion, AnimatePresence } from "motion/react";

type SectionProps = {
  type?: "normal" | "accordion";
  isOpen?: boolean;
  onToggleAccordion?: () => void;
  title: string;
  children?: React.ReactNode;
};

export function Section({
  type = "normal",
  isOpen = true,
  onToggleAccordion,
  title,
  children,
}: SectionProps) {
  return (
    <li className="py-padding-y-xs px-padding-x-m">
      <div className="flex items-center">
        <p className="text-title-3 py-padding-y-xs mr-auto">{title}</p>
        {type === "accordion" && (
          <button onClick={onToggleAccordion}>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <AccordionIcon />
            </motion.div>
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {(type === "normal" || (type === "accordion" && isOpen)) && (
          <motion.div
            key="content"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            //   transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

type SectionItemProps = {
  title: string;
  rightElement?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

export function SectionItem({
  title,
  rightElement,
  onClick,
  disabled,
}: SectionItemProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "py-padding-y-xs flex justify-between items-center cursor-pointer",
        disabled && "text-text-disabled",
      )}
    >
      <p className="text-caption-l">{title}</p>
      {rightElement}
    </div>
  );
}

export function SectionDivider() {
  return (
    <div className="border-b border-interactive-border-default my-gap-y-s" />
  );
}
