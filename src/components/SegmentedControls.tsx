import clsx from "clsx";
import { motion } from "motion/react";

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
  const selectedIndex = options.findIndex((opt) => opt.value === selected);
  const totalOptions = options.length;

  return (
    <div
      className={clsx(
        "relative p-0.5 rounded-[9px] bg-interactive-bg-hover flex items-center",
        className,
      )}
    >
      <motion.div
        className="absolute top-0.5 bottom-0.5 left-0.5 bg-interactive-bg-default border-[0.5px] border-interactive-border-default shadow-1 rounded-lg"
        initial={false}
        animate={{
          x: `calc(${selectedIndex * 100}% )`,
          width: `calc(${100 / totalOptions}% - 1px)`,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      />

      {options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={clsx(
              "relative flex-1 px-padding-x-xxs py-padding-y-xxs transition-colors duration-200",
              isSelected
                ? "text-button-2"
                : "text-caption-m text-text-secondary",
            )}
          >
            <div className="flex justify-center items-center relative">
              <span className="relative block py-0.5">{option.label}</span>
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
