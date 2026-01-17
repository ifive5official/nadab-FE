import { Badge } from "@/components/Badges";
import BlockButton from "@/components/BlockButton";
import { useState } from "react";
import { Popover } from "@/components/Popover";
import type { components } from "@/generated/api-types";
import ReportGeneratingOverlay from "./ReportGeneratingOverlay";
import { REPORT_CONFIGS } from "./reportConfigs";
import clsx from "clsx";
import PeriodicReport from "./PeriodicReport";
import { InfoButton } from "./ReportComponents";
import { useNavigate } from "@tanstack/react-router";

type ReportRes = components["schemas"]["WeeklyReportResponse"];

type Props = {
  reportType: "weekly" | "monthly";
  prevReport: ReportRes | undefined;
  report: ReportRes | undefined;
  onGenerate: () => void;
  crystalBalance: number;
  isLoading: boolean; // 스켈레톤을 보여주는가?
  isGenerating: boolean; // 생성중 로딩 화면을 보여주는가?
};

export default function PeriodicReportCard({
  reportType,
  prevReport,
  report,
  onGenerate,
  crystalBalance,
  isLoading,
  isGenerating,
}: Props) {
  const config = REPORT_CONFIGS[reportType];
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const navigate = useNavigate();

  // 로딩 화면
  if (isGenerating) {
    return <ReportGeneratingOverlay type={reportType} />;
  }

  // 레포트
  if (report) {
    return (
      <PeriodicReport
        reportType={reportType}
        prevReport={prevReport}
        report={report}
        isPopoverOpen={isPopoverOpen}
        setIsPopoverOpen={setIsPopoverOpen}
      />
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
        <BlockButton
          onClick={() => navigate({ to: `/prev-report/${reportType}` })}
          disabled={!prevReport}
          variant="secondary"
        >
          이전 분석 보기
        </BlockButton>
        <BlockButton
          isLoading={isGenerating}
          disabled={crystalBalance < config.cost}
          onClick={onGenerate}
        >
          {config.cost} 크리스탈로 받기
        </BlockButton>
      </div>
    </section>
  );
}
