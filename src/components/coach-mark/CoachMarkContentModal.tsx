import type { CSSProperties } from "react";
import clsx from "clsx";
import BlockButton from "@/components/BlockButton";
import type { CoachMarkButton, CoachMarkStep } from "@/store/coachMarkTourStore";

type CoachMarkContentModalProps = {
  buttons: CoachMarkButton[];
  modalStyle: CSSProperties;
  onButtonClick: (button: CoachMarkButton) => void;
  step: CoachMarkStep;
};

export function CoachMarkContentModal({
  buttons,
  modalStyle,
  onButtonClick,
  step,
}: CoachMarkContentModalProps) {
  return (
    <div className="fixed z-[60]" style={modalStyle}>
      <div className="flex flex-col items-center bg-surface-base dark:bg-surface-layer-2 shadow-3 border border-border-base rounded-2xl text-brand-primary px-padding-x-xl py-padding-y-xl">
        <div className="flex flex-col items-center gap-margin-y-s text-center">
          <p className="text-label-l whitespace-pre-line">{step.title}</p>
          {step.description && (
            <p className="text-caption-m text-text-secondary whitespace-pre-line">
              {step.description}
            </p>
          )}
        </div>
        {buttons.length > 0 && (
          <div
            className={clsx(
              "w-full mt-gap-y-xl",
              buttons.length === 2 && "flex gap-gap-x-s",
            )}
          >
            {buttons.map((button, index) => (
              <BlockButton
                key={`${step.id}-${button.label}-${index}`}
                variant={
                  button.variant ??
                  (buttons.length === 2 && index === 0
                    ? "secondary"
                    : "primary")
                }
                className={button.className}
                onClick={() => onButtonClick(button)}
              >
                {button.label}
              </BlockButton>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
