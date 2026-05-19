import clsx from "clsx";

export default function Seperator({ className }: { className?: string }) {
  return (
    <div className="relative -mx-padding-x-m">
      <div
        className={clsx(
          "border-b border-b-interactive-border-default w-full",
          className,
        )}
      />
    </div>
  );
}
