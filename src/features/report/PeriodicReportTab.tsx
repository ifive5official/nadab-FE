import { useQuery } from "@tanstack/react-query";
import { crystalsOptions } from "../user/quries";
import {
  useDeleteMonthlyReportMutation,
  useDeleteWeeklyReportMutation,
} from "./hooks/useDeleteWeeklyReportMutation";
import useReport from "./hooks/useReport";
import PeriodicReportCard from "./PeriodicReportCard";
import { useGeneratePeriodicReportMutation } from "./hooks/useGeneratePeriodicReportMutation";
import { REPORT_CONFIGS } from "./reportConfigs";
import useToastStore from "@/store/toastStore";

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

  const deleteWeeklyReportMutation = useDeleteWeeklyReportMutation(); // 테스트용
  const deleteMonthlyReportMutation = useDeleteMonthlyReportMutation(); // 테스트용
  return (
    <>
      <button onClick={() => deleteWeeklyReportMutation.mutate()}>
        주간 리포트 삭제(테스트용)
      </button>
      <div className="py-padding-y-m flex flex-col gap-gap-y-l">
        <PeriodicReportCard
          reportType="weekly"
          report={weeklyReport}
          prevReport={prevWeeklyReport}
          onGenerate={generateWeeklyReportMutation.mutate}
          isGenerating={isWeeklyReportGenerating}
          crystalBalance={crystalBalance?.crystalBalance ?? 0}
        />
        <button onClick={() => deleteMonthlyReportMutation.mutate()}>
          월간 리포트 삭제(테스트용)
        </button>
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
