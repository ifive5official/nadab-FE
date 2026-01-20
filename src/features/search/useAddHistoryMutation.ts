// 검색어 저장 - 검색 결과 클릭 및 엔터 입력 시
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";

export function useAddHistoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ keyword }: { keyword: string }) => {
      const res = await api.post("/api/v1/search/histories", {
        keyword,
      });
      return res.data;
    },
    onSuccess: () => {
      // 검색 후 검색 히스토리 리셋
      queryClient.invalidateQueries({
        queryKey: ["currentUser", "searchKeywords"],
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
