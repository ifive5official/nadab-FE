// 주간/월간 리포트 불러오기(폴링 포함)
import { useSuspenseQuery } from "@tanstack/react-query";
import type { components } from "@/generated/api-types";
import { periodicReportOptions } from "../quries";

type weeklyReportsRes = components["schemas"]["MyWeeklyReportResponse"];
type monthlyReportRes = components["schemas"]["MyMonthlyReportResponse"];

type ReportTypeMap = {
  weekly: weeklyReportsRes;
  monthly: monthlyReportRes;
};

type Props<T extends keyof ReportTypeMap> = {
  type: T;
};

export default function useReport<T extends keyof ReportTypeMap>({
  type,
}: Props<T>) {
  // const [isPolling, setIsPolling] = useState(false);
  // Todo: 에러 처리
  const { data: reports } = useSuspenseQuery({
    ...periodicReportOptions(type),
    // 리포트 생성 중일 경우 1초 간격으로 폴링
    refetchInterval: (query) => {
      const status = query.state.data?.report?.status;
      if (status === "PENDING" || status === "IN_PROGRESS") {
        // setIsPolling(true);
        return 1000; // 1초마다 폴링
      }
      // setIsPolling(false);
      return false;
    },
  });

  const status = reports?.report?.status;
  const isGenerating = status === "PENDING" || status === "IN_PROGRESS";

  return {
    report: reports?.report,
    prevReport: reports?.previousReport,
    isGenerating,
  };
}
