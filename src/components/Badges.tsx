// 재사용하는 작은 뱃지처럼 생긴 컴포넌트들
import categories from "@/constants/categories";
import clsx from "clsx";
import { GemFilledIcon } from "./Icons";
import emotions from "@/constants/emotions";

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
        "flex justify-center items-center gap-1 px-2 py-1 bg-button-tertiary-bg-default border border-button-tertiary-border-default rounded-lg text-label-s",
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

// 감정 종류 나타내는 작은 버튼처럼 생긴 컴포넌트
type EmotionBadgeProps = {
  height?: number;
  emotion: (typeof emotions)[number]["code"];
  onClick?: () => void;
  className?: string;
};

export function EmotionBadge({
  height = 28,
  emotion,
  onClick,
  className,
}: EmotionBadgeProps) {
  const item = emotions.find((c) => c.code === emotion)!;
  return (
    <div
      style={{ zoom: height / 28 }}
      className={clsx(
        "flex justify-center items-center gap-1 px-2 py-1 bg-button-tertiary-bg-default border border-button-tertiary-border-default rounded-lg w-fit",
        className
      )}
      onClick={onClick}
    >
      <div className="w-4 aspect-square flex justify-center items-center">
        <div
          style={{
            backgroundColor: item.color,
          }}
          className="w-[13px] aspect-square rounded-full"
        />
      </div>

      <span className="text-label-s">{item.title}</span>
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
      className="flex items-center gap-gap-x-xs bg-button-secondary-bg-default rounded-xl px-padding-x-xs py-padding-y-xs w-fit text-neutral-1000"
    >
      <GemFilledIcon />
      <span className="text-caption-s">{crystals}</span>
    </div>
  );
}
