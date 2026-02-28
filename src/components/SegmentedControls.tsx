import clsx from "clsx";
import { motion } from "motion/react";
import { useId } from "react";

export type Option = {
  label: string;
  value: string;
  hasNotification?: boolean;
};

type Props = {
  options: Option[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function SegmentedControls({
  options,
  selected,
  onChange,
  className,
}: Props) {
  const id = useId();
  return (
    <div
      className={clsx(
        "p-0.5 rounded-[9px] bg-interactive-bg-hover flex items-center",
        className,
      )}
    >
      {options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={clsx(
              "relative flex-1 px-padding-x-xxs py-padding-y-xxs",
              isSelected ? " text-button-2" : "text-caption-m",
            )}
          >
            {isSelected && (
              <motion.div
                layoutId={id}
                layoutDependency={selected}
                className="absolute inset-0 bg-interactive-bg-default border-[0.5px] border-interactive-border-default shadow-1 rounded-lg"
              />
            )}
            <div className="flex justify-center items-center relative z-1">
              <span className="relative z-1 block py-0.5">{option.label}</span>
              {option.hasNotification && (
                <div className="rounded-full bg-brand-primary aspect-square h-1.5 ml-gap-x-s" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
