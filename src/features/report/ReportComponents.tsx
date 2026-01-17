import { InfoIcon } from "@/components/Icons";

export function InfoButton({ onClick }: { onClick: () => void }) {
  return (
    <>
      <button
        onClick={onClick}
        className="bg-button-tertiary-bg-default border border-button-tertiary-border-default rounded-lg px-padding-x-xs py-padding-y-xxs flex items-center gap-gap-x-xs"
      >
        <InfoIcon />
        <span className="text-caption-s text-interactive-border-info">
          더 알아보기
        </span>
      </button>
    </>
  );
}

export function ReportItem({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="flex flex-col gap-gap-y-s text-text-secondary">
      <h4 className="text-label-l text-text-secondary">{title}</h4>
      <p className="text-body-2">{content}</p>
    </div>
  );
}
