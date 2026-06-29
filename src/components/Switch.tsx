/**
 * @description 꼈다켰다 하는 스위치 컴포넌트
 * @page 마이페이지에서 사용
 */

import clsx from "clsx";
import { motion } from "motion/react";

type Props = {
  isOn: boolean;
  onClick: () => void;
};

export default function Switch({ isOn, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex w-[50px] h-[30px] rounded-full border-2 box-border",
        isOn
          ? "justify-end bg-button-primary-bg-default border-button-primary-bg-default"
          : "justify-start bg-interactive-bg-muted border-interactive-bg-muted",
      )}
    >
      <motion.div
        layout
        className="bg-icon-inverse rounded-full h-full aspect-square"
      />
    </button>
  );
}
