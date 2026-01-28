// 특정 검색어 삭제
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";

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
        ["currentUser", "friends", "searchResults"],
        data.data,
      );
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
