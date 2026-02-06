// 전체 검색어 삭제
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

export function useDeleteHistoriesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/api/v1/search/histories`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(["currentUser", "searchKeywords"], {
        histories: [],
      });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
