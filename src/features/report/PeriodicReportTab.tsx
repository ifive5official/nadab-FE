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
