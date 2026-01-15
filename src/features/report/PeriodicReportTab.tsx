import { useQuery } from "@tanstack/react-query";
import { crystalsOptions } from "../user/quries";
import { useDeleteWeeklyReportMutation } from "./useDeleteWeeklyReportMutation";
import useReport from "./useReport";
import PeriodicReportCard from "./PeriodicReportCard";

export default function PeriodicReportTab() {
  const { data: crystalBalance } = useQuery(crystalsOptions);
  const {
    report: weeklyReport,
    prevReport: prevWeeklyReport,
    generateReport: generateWeeklyReport,
    isGenerating: isWeeklyReportGenerating,
    isLoading: isWeeklyReportsLoading,
  } = useReport({ type: "weekly" });
  const {
    report: monthlyReport,
    prevReport: prevMonthlyReport,
    generateReport: generateMonthlyReport,
    isGenerating: isMonthlyReportGenerating,
    isLoading: isMonthlyReportLoading,
  } = useReport({ type: "monthly" });

  const deleteWeeklyReportMutation = useDeleteWeeklyReportMutation(); // 테스트용
  return (
    <>
      <button onClick={() => deleteWeeklyReportMutation.mutate()}>
        주간 레포트 삭제(테스트용)
      </button>
      <div className="py-padding-y-m flex flex-col gap-gap-y-l">
        <PeriodicReportCard
          reportType="weekly"
          prevReport={prevWeeklyReport}
          report={weeklyReport}
          onGenerate={generateWeeklyReport}
          isLoading={isWeeklyReportsLoading}
          isGenerating={isWeeklyReportGenerating}
          cost={20}
          crystalBalance={crystalBalance?.crystalBalance ?? 0}
        />
        <PeriodicReportCard
          reportType="monthly"
          prevReport={prevMonthlyReport}
          report={monthlyReport}
          onGenerate={generateMonthlyReport}
          isLoading={isMonthlyReportLoading}
          isGenerating={isMonthlyReportGenerating}
          cost={40}
          crystalBalance={crystalBalance?.crystalBalance ?? 0}
        />
      </div>
    </>
  );
}
