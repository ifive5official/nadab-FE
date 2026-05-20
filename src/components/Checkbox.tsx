import clsx from "clsx";
import { DoneIcon } from "./Icons";

type Props = {
  boxSize?: "m" | "s";
  textSize?: string;
  label: string;
  checked: boolean;
  className?: string;
  onCheck: () => void;
};

export default function CheckBox({
  boxSize = "m",
  label,
  textSize = "text-label-m",
  checked,
  className,
  onCheck,
}: Props) {
  return (
    <div className={clsx("flex items-center gap-gap-x-s", className)}>
      <div
        className={clsx(
          "aspect-square border flex justify-center items-center rounded-sm cursor-pointer",
          boxSize === "m" && "w-5",
          boxSize === "s" && "w-4",
          checked
            ? "bg-brand-primary border-border-alpha"
            : "bg-interactive-bg-default border-border-layer-1",
        )}
        onClick={() => onCheck()}
      >
        {checked && <DoneIcon size={boxSize === "m" ? 16 : 13} />}
      </div>
      <label
        className={clsx(
          "cursor-pointer",
          textSize,
          checked
            ? "text-interactive-text-default"
            : "text-interactive-text-mute",
        )}
        onClick={() => onCheck()}
      >
        {label}
      </label>
    </div>
  );
}
