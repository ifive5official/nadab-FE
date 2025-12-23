import clsx from "clsx";
import { DoneIcon } from "./Icons";

type Props = {
  label: string;
  checked: boolean;
  onCheck: () => void;
};

export default function CheckBox({ label, checked, onCheck }: Props) {
  return (
    <div className="flex items-center gap-gap-x-s">
      <div
        className={clsx(
          "h-5 w-5 border flex justify-center items-center rounded-sm cursor-pointer",
          checked
            ? "bg-brand-primary border-border-alpha"
            : "bg-interactive-bg-default border-border-layer-1"
        )}
        onClick={() => onCheck()}
      >
        {checked && <DoneIcon />}
      </div>
      <label
        className={clsx(
          "text-label-m cursor-pointer",
          checked
            ? "text-interactive-text-default"
            : "text-interactive-text-mute"
        )}
        onClick={() => onCheck()}
      >
        {label}
      </label>
    </div>
  );
}
