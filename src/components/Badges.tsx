// 재사용하는 작은 뱃지처럼 생긴 컴포넌트들
import categories from "@/constants/categories";
import clsx from "clsx";
import { CloseFilledIcon, GemFilledIcon } from "./Icons";
import emotions from "@/constants/emotions";

// 텍스트와 테마색 테두리가 있는 작은 버튼 컴포넌트
type BadgeProps = {
  isActive?: boolean;
  size?: "s" | "m";
  children: string;
};

export function Badge({ isActive = true, size = "s", children }: BadgeProps) {
  return (
    <div
      className={clsx(
        "rounded-full border ",
        size === "s" && "text-caption-m px-padding-x-xs py-padding-y-xxs",
        size === "m" && "text-button-2 px-padding-x-m py-padding-y-xs",
        isActive
          ? "text-brand-primary border-brand-primary"
          : "text-field-text-disabled border-field-text-disabled",
      )}
    >
      {children}
    </div>
  );
}

// 질문 카테고리 나타내는 작은 버튼처럼 생긴 컴포넌트
type QuestionBadgeProps = {
  height?: number;
  category: (typeof categories)[number]["code"];
  onClick?: () => void;
  isActive?: boolean;
  filled?: boolean;
  className?: string;
};

export function QuestionBadge({
  height = 28,
  category,
  onClick,
  isActive = true,
  filled = false,
  className,
}: QuestionBadgeProps) {
  const item = categories.find((c) => c.code === category)!;
  const Icon = item.icon;
  return (
    <div
      style={{ zoom: height / 28 }}
      className={clsx(
        "flex justify-center items-center gap-1 px-2 py-1 border border-button-tertiary-border-default rounded-lg text-label-s",
        filled ? "bg-surface-layer-1" : "bg-button-tertiary-bg-default",
        className,
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
            : "text-button-disabled-text",
        )}
      >
        {item.title}
      </span>
    </div>
  );
}

// 감정 종류 나타내는 작은 버튼처럼 생긴 컴포넌트
type EmotionBadgeProps = {
  variant?: "normal" | "big" | "search";
  filled?: boolean; // 밝은 배경인지 어두운 배경인지
  height?: number;
  emotion: (typeof emotions)[number]["code"];
  onClick?: () => void;
  className?: string;
};

export function EmotionBadge({
  variant = "normal",
  filled = false,
  emotion,
  onClick,
  className,
}: EmotionBadgeProps) {
  const item = emotions.find((c) => c.code === emotion)!;
  return (
    <div
      className={clsx(
        "flex justify-center items-center gap-1 px-2 border rounded-lg",
        filled ? "bg-surface-layer-1" : "bg-button-tertiary-bg-default",
        variant === "big"
          ? "py-padding-y-xs text-label-m"
          : "py-1 text-label-s",
        variant === "search"
          ? "border-button-tertiary-border-hover"
          : "border-button-tertiary-border-default",
        className,
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
      <span className="whitespace-nowrap text-button-tertiary-text-default">
        {item.title}
      </span>
      {variant === "search" && <CloseFilledIcon />}
    </div>
  );
}

// 크리스탈 갯수 보여주는 뱃지 컴포넌트
type CrystalBadgeProps = {
  height?: number;
  crystals: number;
};

export function CrystalBadge({ height = 25, crystals }: CrystalBadgeProps) {
  return (
    <div
      style={{ zoom: height / 25 }}
      className="flex items-center gap-gap-x-xs bg-button-secondary-bg-default rounded-full px-padding-x-xs py-padding-y-xs w-fit text-neutral-1000"
    >
      <GemFilledIcon />
      <span className="text-caption-s">{crystals}</span>
    </div>
  );
}
