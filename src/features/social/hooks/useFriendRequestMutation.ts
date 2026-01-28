// 친구 요청 보내기
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiResponse, ApiErrResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";

type Props = {
  onSuccess?: () => void;
};

type Res = components["schemas"]["FriendshipResponse"];
type SearchRes = components["schemas"]["SearchUserListResponse"];

export function useFriendRequestMutation({ onSuccess }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiverNickname }: { receiverNickname: string }) => {
      const res = await api.post<ApiResponse<Res>>("/api/v1/friends/requests", {
        receiverNickname,
      });
      return res.data;
    },
    onSuccess: (res, { receiverNickname }) => {
      const { friendshipId } = res.data!;
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
                user.nickname === receiverNickname
                  ? {
                      ...user,
                      friendshipId,
                      relationshipStatus: "REQUEST_SENT",
                    }
                  : user,
              ),
            })),
          };
        },
      );
      onSuccess?.();
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
