// 재사용하는 작은 뱃지처럼 생긴 컴포넌트들
import categories from "@/constants/categories";
import clsx from "clsx";
import { GemFilledIcon } from "./Icons";

// 질문 카테고리 나타내는 작은 버튼처럼 생긴 컴포넌트
type QuestionBadgeProps = {
  height?: number;
  category: (typeof categories)[number]["title"];
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
};

export function QuestionBadge({
  height = 28,
  category,
  onClick,
  isActive = true,
  className,
}: QuestionBadgeProps) {
  const item = categories.find((c) => c.title === category)!;
  const Icon = item.icon;
  return (
    <div
      style={{ zoom: height / 28 }}
      className={clsx(
        "flex justify-center items-center gap-1 px-2 py-1 bg-button-tertiary-bg-default border border-button-tertiary-border-default rounded-lg",
        className
      )}
      onClick={onClick}
    >
      <Icon
        fill={
          isActive ? "var(--color-icon-primary)" : "var(--color-icon-disabled)"
        }
      />
      <span
        className={clsx(
          "text-label-s",
          isActive
            ? "text-button-tertiary-text-default"
            : "text-button-disabled-text"
        )}
      >
        {item.title}
      </span>
    </div>
  );
}

type CrystalBadgeProps = {
  height?: number;
  crystals: number;
};

export function CrystalBadge({ height = 25, crystals }: CrystalBadgeProps) {
  return (
    <div
      style={{ zoom: height / 25 }}
      className="flex items-center gap-gap-x-xs bg-button-secondary-bg-default rounded-xl px-padding-x-xs py-padding-y-xs"
    >
      <GemFilledIcon />
      <span className="text-caption-s">{crystals}</span>
    </div>
  );
}
