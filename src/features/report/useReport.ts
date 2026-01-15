// 주간/월간 리포트 생성 및 불러오기
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiResponse, ApiErrResponse } from "@/generated/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { components } from "@/generated/api-types";
import { useState } from "react";
import { REPORT_CONFIGS } from "./reportConfigs";

type weeklyReportsRes = components["schemas"]["MyWeeklyReportResponse"];
type monthlyReportRes = components["schemas"]["MyMonthlyReportResponse"];
type generateWeeklyReportRes =
  components["schemas"]["WeeklyReportStartResponse"];
type generateMonthlyReportRes =
  components["schemas"]["MonthlyReportStartResponse"];

type ReportTypeMap = {
  weekly: weeklyReportsRes;
  monthly: monthlyReportRes;
};

type generateReportTypeMap = {
  weekly: generateWeeklyReportRes;
  monthly: generateMonthlyReportRes;
};

type Props<T extends keyof ReportTypeMap> = {
  type: T;
};
export default function useReport<T extends keyof ReportTypeMap>({
  type,
}: Props<T>) {
  const config = REPORT_CONFIGS[type];
  const queryClient = useQueryClient();
  const [isPolling, setIsPolling] = useState(false);
  // Todo: 에러 처리
  const { data: reports, isLoading } = useQuery({
    queryKey: ["currentUser", config.key],
    queryFn: async () => {
      // 레포트 조회
      const res = await api.get<ApiResponse<ReportTypeMap[T]>>(
        `/api/v1/${config.key}`
      );
      return res.data.data!;
    },
    // 레포트 생성 중일 경우 1초 간격으로 폴링
    refetchInterval: (query) => {
      const status = query.state.data?.report?.status;
      if (status === "PENDING" || status === "IN_PROGRESS") {
        setIsPolling(true);
        return 1000; // 1초마다 폴링
      }
      setIsPolling(false);
      return false;
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<generateReportTypeMap[T]>>(
        `/api/v1/${config.key}/start`
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUser", config.key],
      });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      if (err.response?.data?.code === `${config.errKey}_NOT_ENOUGH_REPORTS`) {
        useErrorStore
          .getState()
          .showError(
            `지난${config.periodText} 분석이 완성되지 못했어요.`,
            `이번${config.periodText} 기록을 열심히 작성해서\n다음 분석을 완성해봐요.`
          );
      } else {
        useErrorStore.getState().showError(
          // Todo: 에러 메시지 변경
          err.response?.data?.code ?? "",
          err.response?.data?.message ??
            "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요."
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser", "crystals"] });
    },
  });
  const isGenerating = isPolling;

  return {
    report: reports?.report,
    prevReport: reports?.previousReport,
    isLoading: isLoading && !isPolling,
    isGenerating,
    generateReport: generateReportMutation.mutate,
  };
}
