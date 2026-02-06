// 검색어 저장 - 검색 결과 클릭 및 엔터 입력 시
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

export function useAddFriendHistoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nickname }: { nickname: string }) => {
      const res = await api.post("/api/v1/friends/search/histories", {
        nickname,
      });
      return res.data;
    },
    onSuccess: () => {
      // 검색 후 검색 히스토리 리셋
      queryClient.invalidateQueries({
        queryKey: ["currentUser", "friends", "searchHistories"],
      });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
