// 주간 리포트 및 월간 리포트 삭제(테스트용)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

export function useDeleteWeeklyReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`/api/v1/test/delete/weekly-report`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ["currentUser", "weekly-report"],
      });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}

export function useDeleteMonthlyReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`/api/v1/test/delete/monthly-report`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ["currentUser", "monthly-report"],
      });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
