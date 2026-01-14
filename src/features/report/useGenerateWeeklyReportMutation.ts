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

type generateWeeklyReportRes =
  components["schemas"]["WeeklyReportStartResponse"];

export function useGenerateWeeklyReportMutation({ onSuccess }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<generateWeeklyReportRes>>(
        "/api/v1/weekly-report/start"
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUser", "weeklyReport"],
      });
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
