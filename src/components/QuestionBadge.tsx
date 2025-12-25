// 질문 카테고리 나타내는 작은 버튼처럼 생긴 컴포넌트
import categories from "@/constants/categories";
import clsx from "clsx";

type Props = {
  height?: number;
  category: (typeof categories)[number]["title"];
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
};

export default function QuestionBadge({
  height = 28,
  category,
  onClick,
  isActive = true,
  className,
}: Props) {
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
