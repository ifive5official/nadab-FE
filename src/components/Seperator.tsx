/**
 * @description 1픽셀 높이의 회색 구분선
 */
import clsx from "clsx";

export default function Seperator({ className }: { className?: string }) {
  return (
    <div className="relative">
      <div
        className={clsx(
          "border-b border-b-interactive-border-default w-full",
          className,
        )}
      />
    </div>
  );
}
