// 리포트 페이지에서 리포트가 없거나 로딩중일 때 보여줄 것
import { Badge } from "@/components/Badges";
import BlockButton from "@/components/BlockButton";
import { useState } from "react";
import { Popover } from "@/components/Popover";
import type { components } from "@/generated/api-types";
import { REPORT_CONFIGS } from "./reportConfigs";
import { InfoButton } from "./ReportComponents";
import { useNavigate } from "@tanstack/react-router";

type ReportRes = components["schemas"]["WeeklyReportResponse"];

type Props = {
  reportType: "weekly" | "monthly";
  prevReport: ReportRes | undefined;
  onGenerate: () => void;
  crystalBalance: number;
  isGenerating: boolean; // 생성중 로딩 화면을 보이기 위함
};

export default function PeriodicReportCard({
  reportType,
  prevReport,
  onGenerate,
  crystalBalance,
  isGenerating,
}: Props) {
  const config = REPORT_CONFIGS[reportType];
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <section
      className={
        "px-margin-x-l py-margin-y-xl bg-surface-layer-1 rounded-2xl shadow-2"
      }
    >
      <div className={"flex flex-col gap-margin-y-m mb-padding-y-xxl"}>
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
          {isGenerating
            ? `지난${config.periodText} 레포트를 생성 중이에요.`
            : `지난${config.periodText} 리포트를 받아볼까요?`}
        </h3>
        <p className="text-caption-l whitespace-pre-line">
          {isGenerating
            ? `리포트 생성에 1-2분 정도 걸릴 수 있어요.\n조금만 기다려주세요.`
            : `지난${config.periodText}에 답변을 ${config.requiredAnswers}건 이상 작성했다면 리포트를 생성할 수 있어요. 지난${config.periodText} 리포트로 나를 되돌아보세요.`}
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
