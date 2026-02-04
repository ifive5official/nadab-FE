// 주간/월간 레포트 생성 뮤테이션
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { REPORT_CONFIGS } from "../reportConfigs";

type generateWeeklyReportRes =
  components["schemas"]["WeeklyReportStartResponse"];
type generateMonthlyReportRes =
  components["schemas"]["MonthlyReportStartResponse"];

type generateReportTypeMap = {
  weekly: generateWeeklyReportRes;
  monthly: generateMonthlyReportRes;
};

type Props<T extends keyof generateReportTypeMap> = {
  onSuccess?: () => void;
  reportType: T;
};

export function useGeneratePeriodicReportMutation<
  T extends keyof generateReportTypeMap,
>({ onSuccess, reportType }: Props<T>) {
  const config = REPORT_CONFIGS[reportType];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<generateReportTypeMap[T]>>(
        `/api/v1/${config.key}/start`,
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUser", config.key],
      });
      onSuccess?.();
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      if (err.response?.data?.code === `${config.errKey}_NOT_ENOUGH_REPORTS`) {
        useErrorStore
          .getState()
          .showError(
            `지난${config.periodText} 분석이 완성되지 못했어요.`,
            `이번${config.periodText} 기록을 열심히 작성해서\n다음 분석을 완성해봐요.`,
          );
      } else {
        useErrorStore.getState().showError(
          // Todo: 에러 메시지 변경
          err.response?.data?.code ?? "",
          err.response?.data?.message ??
            "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요.",
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser", "crystals"] });
    },
  });
}
