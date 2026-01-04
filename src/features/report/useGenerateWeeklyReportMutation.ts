// 일간 리포트 생성
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";

type Props = {
  onSuccess?: () => void;
};

type weeklyReportRes = components["schemas"]["WeeklyReportResponse"];
type generateWeeklyReportRes =
  components["schemas"]["WeeklyReportStartResponse"];

export function useGenerateWeeklyReportMutation({ onSuccess }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const startRes = await api.post<ApiResponse<generateWeeklyReportRes>>(
        "/api/v1/weekly-report/start"
      );
      const { reportId } = startRes.data.data!;
      // 0.5초마다 폴링
      let isFinished = false;
      let reportData: weeklyReportRes | null = null;
      while (!isFinished) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const statusRes = await api.get<ApiResponse<weeklyReportRes>>(
          `/api/v1/weekly-report/${reportId}`
        );
        const currentReport = statusRes.data.data!;

        if (currentReport.status === "COMPLETED") {
          isFinished = true;
          reportData = currentReport;
        } else if (currentReport.status === "FAILED") {
          useErrorStore
            .getState()
            .showError(
              "주간 레포트를 생성하는 데 실패했어요.",
              "잠시 후 다시 시도해 주세요."
            );
        } else {
          // pending ui 보여줌
        }
      }
      return reportData;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser", "weeklyReport"], data);
      onSuccess?.();
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      if (err.response?.data?.code === "WEEKLY_REPORT_NOT_ENOUGH_REPORTS") {
        useErrorStore
          .getState()
          .showError(
            "지난주 분석이 완성되지 못했어요.",
            "이번주 기록을 열심히 작성해서\n다음 분석을 완성해봐요."
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
}
