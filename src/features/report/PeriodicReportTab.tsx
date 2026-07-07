import { useQuery } from "@tanstack/react-query";
import { crystalsOptions } from "../user/queries";
import useReport from "./hooks/useReport";
import PeriodicReportCard from "./PeriodicReportCard";
import { useGeneratePeriodicReportMutation } from "./hooks/useGeneratePeriodicReportMutation";
import { useGenerateMonthlyReportV2Mutation } from "./hooks/useGenerateMonthlyReportV2Mutation";
import { REPORT_CONFIGS } from "./reportConfigs";
import useToastStore from "@/store/toastStore";
import Seperator from "@/components/Seperator";
import useMonthlyReportV2 from "./hooks/useMonthlyReportV2";
import MonthlyReportV2Card from "./MonthlyReportV2Card";
import { AppIcon } from "@/components/AppIcon";
import { Link } from "@tanstack/react-router";

export default function PeriodicReportTab() {
  const { data: crystalBalance } = useQuery(crystalsOptions);
  const { showToast } = useToastStore();
  const {
    report: weeklyReport,
    prevReport: prevWeeklyReport,
    isGenerating: isWeeklyReportGenerating,
  } = useReport({ type: "weekly" });
  const generateWeeklyReportMutation = useGeneratePeriodicReportMutation({
    reportType: "weekly",
    onSuccess: () =>
      showToast({
        message: `${REPORT_CONFIGS["weekly"].cost} 크리스탈이 소진되었어요.`,
      }),
  });
  const {
    report: monthlyReportV2,
    prevReport: prevMonthlyReportV2,
    isGenerating: isMonthlyReportV2Generating,
  } = useMonthlyReportV2();
  const generateMonthlyReportV2Mutation = useGenerateMonthlyReportV2Mutation({
    onSuccess: () =>
      showToast({
        message: `${REPORT_CONFIGS["monthly"].cost} 크리스탈이 소진되었어요.`,
      }),
  });

  return (
    <>
      <Seperator />
      <Link to="/report/history" className="py-padding-y-l">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-caption-m text-text-primary">
              이전 리포트 보기
            </span>
            <span className="text-caption-s text-text-tertiary">
              지금까지 생성된 모든 리포트를 확인해보세요.
            </span>
          </div>
          <div>
            <AppIcon name="chevron-right" />
          </div>
        </div>
      </Link>
      <Seperator />
      <div className="py-padding-y-m flex flex-col gap-gap-y-l">
        <MonthlyReportV2Card
          report={monthlyReportV2}
          prevReport={prevMonthlyReportV2}
          onGenerate={generateMonthlyReportV2Mutation.mutate}
          isGenerating={isMonthlyReportV2Generating}
          crystalBalance={crystalBalance?.crystalBalance ?? 0}
        />
        <PeriodicReportCard
          reportType="weekly"
          report={weeklyReport}
          prevReport={prevWeeklyReport}
          onGenerate={generateWeeklyReportMutation.mutate}
          isGenerating={isWeeklyReportGenerating}
          crystalBalance={crystalBalance?.crystalBalance ?? 0}
        />
      </div>
    </>
  );
}
