// 일간 리포트 생성
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { formatISODate } from "@/lib/formatters";
import useModalStore from "@/store/modalStore";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type Props = {
  onSuccess?: (reportId: number) => void;
};

type Req = components["schemas"]["DailyReportRequest"];
type Res = components["schemas"]["CreateDailyReportResponse"];

export function useGenerateReportMutation({ onSuccess }: Props) {
  const { showError } = useModalStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, answer, objectKey }: Req) => {
      const res = await api.post<ApiResponse<Res>>(
        `/api/v1/daily-report/generate`,
        {
          questionId,
          answer,
          objectKey,
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      const today = formatISODate(new Date());
      queryClient.invalidateQueries({ queryKey: ["currentUser", "crystals"] });
      queryClient.setQueryData(["currentUser", "report", today], data.data);
      onSuccess?.(data.data?.reportId ?? 0);
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      if (
        err.response?.data?.code === "AI_RESPONSE_PARSE_FAILED" ||
        err.response?.data?.code === "AI_RESPONSE_FORMAT_INVALID" ||
        err.response?.data?.code === "AI_NO_RESPONSE"
      ) {
        showError(
          "리포트 생성 도중 문제가 발생했어요.",
          "다시 한번 시도해 주세요.",
        );
      } else {
        handleDefaultApiError(err);
      }
    },
  });
}
