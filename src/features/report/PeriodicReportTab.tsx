import { useQuery } from "@tanstack/react-query";
import { crystalsOptions } from "../user/quries";
// import {
//   useDeleteMonthlyReportMutation,
//   useDeleteWeeklyReportMutation,
// } from "./hooks/useDeleteWeeklyReportMutation";
import useReport from "./hooks/useReport";
import PeriodicReportEmpty from "./PeriodicReportEmpty";
import { useGeneratePeriodicReportMutation } from "./hooks/useGeneratePeriodicReportMutation";
import PeriodicReport from "./PeriodicReport";

export default function PeriodicReportTab() {
  const { data: crystalBalance } = useQuery(crystalsOptions);
  const {
    report: weeklyReport,
    prevReport: prevWeeklyReport,
    isGenerating: isWeeklyReportGenerating,
  } = useReport({ type: "weekly" });
  const generateWeeklyReportMutation = useGeneratePeriodicReportMutation({
    reportType: "weekly",
  });
  const {
    report: monthlyReport,
    prevReport: prevMonthlyReport,
    isGenerating: isMonthlyReportGenerating,
  } = useReport({ type: "monthly" });
  const generateMonthlyReportMutation = useGeneratePeriodicReportMutation({
    reportType: "monthly",
  });

  // const deleteWeeklyReportMutation = useDeleteWeeklyReportMutation(); // 테스트용
  // const deleteMonthlyReportMutation = useDeleteMonthlyReportMutation(); // 테스트용
  return (
    <>
      {/* <button onClick={() => deleteWeeklyReportMutation.mutate()}>
        주간 레포트 삭제(테스트용)
      </button> */}
      <div className="py-padding-y-m flex flex-col gap-gap-y-l">
        {weeklyReport && !isWeeklyReportGenerating ? (
          <PeriodicReport
            reportType={"weekly"}
            prevReport={prevWeeklyReport}
            report={weeklyReport}
          />
        ) : (
          <PeriodicReportEmpty
            reportType="weekly"
            prevReport={prevWeeklyReport}
            onGenerate={generateWeeklyReportMutation.mutate}
            isGenerating={isWeeklyReportGenerating}
            crystalBalance={crystalBalance?.crystalBalance ?? 0}
          />
        )}

        {/* <button onClick={() => deleteMonthlyReportMutation.mutate()}>
          월간 레포트 삭제(테스트용)
        </button> */}
        {monthlyReport && !isMonthlyReportGenerating ? (
          <PeriodicReport
            reportType={"monthly"}
            prevReport={prevMonthlyReport}
            report={monthlyReport}
          />
        ) : (
          <PeriodicReportEmpty
            reportType="monthly"
            prevReport={prevMonthlyReport}
            onGenerate={generateMonthlyReportMutation.mutate}
            isGenerating={isMonthlyReportGenerating}
            crystalBalance={crystalBalance?.crystalBalance ?? 0}
          />
        )}
      </div>
    </>
  );
}
