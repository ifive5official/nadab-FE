// 주간/월간 리포트 불러오기(폴링 포함)
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import type { components } from "@/generated/api-types";
import { periodicReportOptions } from "../quries";
import useModalStore from "@/store/modalStore";
import { REPORT_CONFIGS } from "../reportConfigs";

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
  const config = REPORT_CONFIGS[type];
  const queryClient = useQueryClient();

  // Todo: 에러 처리
  const { data: reports } = useSuspenseQuery({
    ...periodicReportOptions(type),
    // 리포트 생성 중일 경우 1초 간격으로 폴링
    refetchInterval: (query) => {
      const status = query.state.data?.report?.status;
      if (status === "PENDING" || status === "IN_PROGRESS") {
        return 1000; // 1초마다 폴링
      }
      return false;
    },
  });

  const status = reports?.report?.status;
  if (status === "FAILED") {
    useModalStore
      .getState()
      .showError(
        "리포트 생성 도중 문제가 발생했어요.",
        "다시 시도해주세요. 사용한 크리스탈은 환불되었어요.",
      );
    queryClient.invalidateQueries({
      queryKey: ["currentUser", config.key],
    });
  }
  const isGenerating = status === "PENDING" || status === "IN_PROGRESS";

  return {
    report: reports?.report?.status !== "FAILED" ? reports?.report : undefined,
    prevReport:
      reports?.previousReport?.status !== "FAILED"
        ? reports?.previousReport
        : undefined,
    isGenerating,
  };
}
