// 유형 리포트 삭제(테스트용)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

export function useDeleteTypeReportMutation({
  interestCode,
}: {
  interestCode: string;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post(
        `/api/v1/test/delete/type-report/${interestCode}`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ["currentUser", "type-report"],
      });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
