// 특정 검색어 삭제
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type Res = components["schemas"]["SearchHistoryListResponse"];

export function useDeleteFriendHistoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nickname }: { nickname: string }) => {
      const res = await api.delete<ApiResponse<Res>>(
        `/api/v1/friends/search/histories/${nickname}`,
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["currentUser", "friends", "searchHistories"],
        data.data,
      );
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
