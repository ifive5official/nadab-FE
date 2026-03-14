import clsx from "clsx";
import { DoneIcon } from "./Icons";

type Props = {
  textSize?: string;
  label: string;
  checked: boolean;
  onCheck: () => void;
};

export default function CheckBox({
  label,
  textSize = "text-label-m",
  checked,
  onCheck,
}: Props) {
  return (
    <div className="flex items-center gap-gap-x-s">
      <div
        className={clsx(
          "h-5 w-5 border flex justify-center items-center rounded-sm cursor-pointer",
          checked
            ? "bg-brand-primary border-border-alpha"
            : "bg-interactive-bg-default border-border-layer-1",
        )}
        onClick={() => onCheck()}
      >
        {checked && <DoneIcon />}
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
