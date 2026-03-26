import { InfoIcon } from "@/components/Icons";
import type { components } from "@/generated/api-types";
import clsx from "clsx";

export function InfoButton({ onClick }: { onClick: () => void }) {
  return (
    <>
      <button
        onClick={onClick}
        className="bg-button-tertiary-bg-default border border-button-tertiary-border-default rounded-lg px-padding-x-xs py-padding-y-xxs flex items-center gap-gap-x-xs"
      >
        <InfoIcon />
        <span className="text-caption-s text-interactive-border-info whitespace-nowrap">
          더 알아보기
        </span>
      </button>
    </>
  );
}

type Segment = components["schemas"]["Segment"];
type StyledSegmentsProps = {
  segments: Segment[];
  type: "mix" | "bold";
};

export function StyledSegments({ segments, type }: StyledSegmentsProps) {
  return (
    <>
      {segments?.map((segment, i) => {
        if (segment.marks!.length > 0) {
          return (
            <span
              key={i}
              className={clsx(
                "font-bold!",
                type === "mix" &&
                  "bg-[linear-gradient(transparent_50%,var(--color-brand-primary-alpha-10)_50%)] dark:bg-[linear-gradient(transparent_50%,var(--color-brand-primary-alpha-50)_50%)]",
              )}
            >
              {segment.text}
            </span>
          );
        } else {
          return segment.text;
        }
      })}
    </>
  );
}
