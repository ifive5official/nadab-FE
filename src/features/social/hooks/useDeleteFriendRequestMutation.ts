// 친구 요청 취소
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";

type SearchRes = components["schemas"]["SearchUserListResponse"];

export function useDeleteFriendRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ friendshipId }: { friendshipId: number }) => {
      const res = await api.delete(`/api/v1/friends/requests/${friendshipId}`);
      return res.data;
    },
    onSuccess: (_, { friendshipId }) => {
      queryClient.invalidateQueries({
        queryKey: ["currentUser", "friends", "list"],
      });
      // 재로딩 방지 위해 검색결과 캐시 세팅
      queryClient.setQueriesData<InfiniteData<SearchRes>>(
        { queryKey: ["currentUser", "friends", "searchResults"] },
        (oldData) => {
          if (!oldData) return undefined;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              searchResults: page.searchResults?.map((user) =>
                user.friendshipId === friendshipId
                  ? {
                      ...user,
                      friendshipId: undefined,
                      relationshipStatus: "NONE",
                    }
                  : user,
              ),
            })),
          };
        },
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
