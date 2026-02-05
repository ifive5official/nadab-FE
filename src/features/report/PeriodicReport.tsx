// 리포트 및 이전 분석 보기 페이지에서 리포트가 있을 때 보여줄 것
import BlockButton from "@/components/BlockButton";
import { InfoButton } from "./ReportComponents";
import { Popover } from "@/components/Popover";
import type { components } from "@/generated/api-types";
import { ReportItem } from "./ReportComponents";
import { useNavigate } from "@tanstack/react-router";
import { getPreviousPeriodText } from "@/lib/getPrevPeriod";
import { useState } from "react";

type ReportRes = components["schemas"]["WeeklyReportResponse"];

type Props = {
  variant?: "prev" | "current"; // 이전 분석 보기 페이지인지 리포트 페이지인지
  reportType: "weekly" | "monthly";
  prevReport: ReportRes | undefined;
  report: ReportRes;
};

export default function PeriodicReport({
  variant = "current",
  reportType,
  prevReport,
  report,
}: Props) {
  const reportTitle =
    reportType === "weekly"
      ? `${report?.month}월 ${report?.weekOfMonth}주차 분석`
      : `${report?.month}월 분석`;
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
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
          <ReportItem
            title="다음엔 이렇게 보완해볼까요?"
            content={report.improve!}
          />
          {variant === "current" && (
            <BlockButton
              onClick={() => navigate({ to: `/prev-report/${reportType}` })}
              variant="secondary"
              disabled={!prevReport}
            >
              {getPreviousPeriodText(reportType, "prev")} 분석 보기
            </BlockButton>
          )}
        </div>
      </section>
    </>
  );
}
