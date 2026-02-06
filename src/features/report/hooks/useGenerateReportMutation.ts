// 일간 리포트 생성
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { formatISODate } from "@/lib/formatDate";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type Props = {
  onSuccess?: () => void;
};

type Req = components["schemas"]["DailyReportRequest"];
type Res = components["schemas"]["CreateDailyReportResponse"];

export function useGenerateReportMutation({ onSuccess }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, answer }: Req) => {
      const res = await api.post<ApiResponse<Res>>(
        `/api/v1/daily-report/generate`,
        {
          questionId,
          answer,
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      const today = formatISODate(new Date());
      queryClient.invalidateQueries({ queryKey: ["currentUser", "crystals"] });
      queryClient.setQueryData(["currentUser", "report", today], data.data);
      onSuccess?.();
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
