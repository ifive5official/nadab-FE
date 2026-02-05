// 전체 검색어 삭제
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/modalStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";

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
      useErrorStore.getState().showError(
        // Todo: 에러 메시지 변경
        err.response?.data?.code ?? err.message,
        err.response?.data?.message ??
          "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요.",
      );
    },
  });
}
