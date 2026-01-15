import { Badge } from "@/components/Badges";
import BlockButton from "@/components/BlockButton";
import { useState } from "react";
import { Popover } from "@/components/Popover";
import type { components } from "@/generated/api-types";
import ReportGeneratingOverlay from "./ReportGeneratingOverlay";
import { REPORT_CONFIGS } from "./reportConfigs";
import clsx from "clsx";
import { InfoIcon } from "@/components/Icons";

type ReportRes = components["schemas"]["WeeklyReportResponse"];

type Props = {
  reportType: "weekly" | "monthly";
  prevReport: ReportRes | undefined;
  report: ReportRes | undefined;
  onGenerate: () => void;
  cost: number;
  crystalBalance: number;
  isLoading: boolean; // 스켈레톤을 보여주는가?
  isGenerating: boolean; // 생성중 로딩 화면을 보여주는가?
};

export default function PeriodicReportCard({
  reportType,
  prevReport,
  report,
  onGenerate,
  cost,
  crystalBalance,
  isLoading,
  isGenerating,
}: Props) {
  const config = REPORT_CONFIGS[reportType];
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // 로딩 화면
  if (isGenerating) {
    return <ReportGeneratingOverlay type={reportType} />;
  }

  // 레포트
  if (report) {
    const reportTitle =
      reportType === "weekly"
        ? `${report?.month}월 ${report?.weekOfMonth}주차 분석`
        : `${report?.month}월 분석`;
    return (
      <section className="px-padding-x-m pt-padding-y-m pb-padding-y-xl bg-surface-layer-1 rounded-2xl shadow-2">
        <div className="relative flex justify-between">
          <h3 className="text-title-2">{reportTitle}</h3>
          <InfoButton onClick={() => setIsPopoverOpen(true)} />
          <div className="absolute z-1 top-full w-full mt-margin-y-m flex justify-center">
            <Popover
              isOpen={isPopoverOpen}
              onClose={() => setIsPopoverOpen(false)}
            />
          </div>
        </div>
        <div className="border-b border-b-surface-layer-2 my-gap-y-l" />
        <div className="flex flex-col gap-gap-y-xl">
          <ReportItem
            title="이런 면도 발견되었어요."
            content={report.discovered!}
          />
          <ReportItem title="이런 점이 좋았어요." content={report.good!} />
          <ReportItem
            title="다음엔 이렇게 보완해볼까요?"
            content={report.improve!}
          />
          <BlockButton variant="secondary" disabled={!prevReport}>
            {config.prevBtnText}
          </BlockButton>
        </div>
      </section>
    );
  }

  // 레포트 없음
  return (
    <section
      className={clsx(
        "px-margin-x-l py-margin-y-xl bg-surface-layer-1 rounded-2xl shadow-2",
        isLoading && "animate-pulse"
      )}
    >
      <div
        className={clsx(
          "flex flex-col gap-margin-y-m mb-padding-y-xxl",
          isLoading && "invisible"
        )}
      >
        <div className="relative flex justify-between items-center">
          <Badge>{config.label}</Badge>
          <InfoButton onClick={() => setIsPopoverOpen(true)} />
          <div className="absolute z-1 top-full w-full mt-margin-y-m flex justify-center">
            <Popover
              isOpen={isPopoverOpen}
              onClose={() => setIsPopoverOpen(false)}
            />
          </div>
        </div>
        <h3 className="text-title-2">
          지난{config.periodText} 리포트를 받아볼까요?
        </h3>
        <p className="text-caption-l">
          지난{config.periodText}에 답변을 {config.requiredAnswers}건 이상
          작성했다면 리포트를 생성할 수 있어요. 지난{config.periodText} 리포트로
          나를 되돌아보세요.
        </p>
      </div>
      <div className="flex gap-gap-x-xs">
        <BlockButton disabled={!prevReport} variant="secondary">
          이전 분석 보기
        </BlockButton>
        <BlockButton
          isLoading={isGenerating}
          disabled={crystalBalance < cost}
          onClick={onGenerate}
        >
          {cost} 크리스탈로 받기
        </BlockButton>
      </div>
    </section>
  );
}

function InfoButton({ onClick }: { onClick: () => void }) {
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

function ReportItem({ title, content }: { title: string; content: string }) {
  return (
    <div className="flex flex-col gap-gap-y-s text-text-secondary">
      <h4 className="text-label-l text-text-secondary">{title}</h4>
      <p className="text-body-2">{content}</p>
    </div>
  );
}
