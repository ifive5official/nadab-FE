/**
 * @description 선으로 버튼 구분하는 구조의 모달
 * @note 다른 모달 컴포넌트 내부에서 쓰임
 */

import type { Item } from "@/store/bottomModalStore";
import clsx from "clsx";
import { motion, type Variants } from "motion/react";

type Props = {
  className?: string;
  title?: string;
  items: Item[];
  animationVariants: Variants;
  "data-coachmark"?: string;
};

export default function ListModal({
  className,
  title,
  items,
  animationVariants,
  ...props
}: Props) {
  return (
    <motion.div
      className={clsx(
        "z-30 absolute sm:mx-auto sm:w-[412px] flex flex-col items-center bg-surface-base dark:bg-surface-layer-2 shadow-3 border border-border-base rounded-lg divide-y divide-interactive-border-default dark:divide-field-border-hover text-text-primary",
        className,
      )}
      variants={animationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: "easeInOut" }}
      {...props}
    >
      {title && (
        <p className="w-full text-center text-caption-m py-padding-y-m">
          {title}
        </p>
      )}

      {items.map((item) => {
        return (
          <button
            key={item.label}
            onClick={item.onClick}
            className={clsx(
              "w-full text-button-1 py-padding-y-m",
              item.type === "selected" && "bg-surface-layer-1",
            )}
          >
            <span
              className={clsx(
                item.type === "warning" && "text-feedback-error-fg underline",
                item.type === "selected" && "font-bold",
                item.type === "unselected" && "text-text-disabled",
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </motion.div>
  );
}
