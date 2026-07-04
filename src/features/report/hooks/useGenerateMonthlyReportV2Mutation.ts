import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { api } from "@/lib/axios";
import { handleDefaultApiError } from "@/lib/handleDefaultError";
import useErrorStore from "@/store/modalStore";
import { REPORT_CONFIGS } from "../reportConfigs";
import { monthlyReportV2Options } from "../quries";
import { startMonthlyReportV2Fixture } from "../monthlyReportFixtures";

type MonthlyReportStartResponse =
  components["schemas"]["MonthlyReportStartResponse"];

type Props = {
  onSuccess?: () => void;
};

export function useGenerateMonthlyReportV2Mutation({ onSuccess }: Props = {}) {
  const queryClient = useQueryClient();
  const config = REPORT_CONFIGS.monthly;

  return useMutation({
    mutationFn: async () => {
      const fixture = startMonthlyReportV2Fixture();
      if (fixture) return fixture;

      const res = await api.post<ApiResponse<MonthlyReportStartResponse>>(
        "/api/v2/monthly-report/start",
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: monthlyReportV2Options.queryKey,
      });
      onSuccess?.();
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      if (err.response?.data?.code === `${config.errKey}_NOT_ENOUGH_REPORTS`) {
        useErrorStore
          .getState()
          .showError(
            `지난${config.periodText} 리포트가 완성되지 못했어요.`,
            `이번${config.periodText} 기록을 열심히 작성해서\n다음 리포트를 완성해봐요.`,
          );
      } else {
        handleDefaultApiError(err);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser", "crystals"] });
    },
  });
}
