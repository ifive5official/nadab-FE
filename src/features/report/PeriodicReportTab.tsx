import { useQuery } from "@tanstack/react-query";
import { crystalsOptions } from "../user/quries";
import useReport from "./hooks/useReport";
import PeriodicReportCard from "./PeriodicReportCard";
import { useGeneratePeriodicReportMutation } from "./hooks/useGeneratePeriodicReportMutation";
import { REPORT_CONFIGS } from "./reportConfigs";
import useToastStore from "@/store/toastStore";
import Seperator from "@/components/Seperator";

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
    report: monthlyReport,
    prevReport: prevMonthlyReport,
    isGenerating: isMonthlyReportGenerating,
  } = useReport({ type: "monthly" });
  const generateMonthlyReportMutation = useGeneratePeriodicReportMutation({
    reportType: "monthly",
    onSuccess: () =>
      showToast({
        message: `${REPORT_CONFIGS["monthly"].cost} 크리스탈이 소진되었어요.`,
      }),
  });

  return (
    <>
      <Seperator />
      <div className="py-padding-y-m flex flex-col gap-gap-y-l">
        <PeriodicReportCard
          reportType="weekly"
          report={weeklyReport}
          prevReport={prevWeeklyReport}
          onGenerate={generateWeeklyReportMutation.mutate}
          isGenerating={isWeeklyReportGenerating}
          crystalBalance={crystalBalance?.crystalBalance ?? 0}
        />
        <PeriodicReportCard
          reportType="monthly"
          report={monthlyReport}
          prevReport={prevMonthlyReport}
          onGenerate={generateMonthlyReportMutation.mutate}
          isGenerating={isMonthlyReportGenerating}
          crystalBalance={crystalBalance?.crystalBalance ?? 0}
        />
      </div>
    </>
  );
}
