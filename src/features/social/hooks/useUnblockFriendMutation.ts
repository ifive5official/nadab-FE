// 친구 차단 해제
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";
import type { components } from "@/generated/api-types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = {
  onSuccess?: () => void;
  onSettled?: (
    data: any,
    error: any,
    variables: { userBlockId: number },
  ) => void;
};

type BlockedFriendsRes = components["schemas"]["BlockedUserListResponse"];

export function useUnBlockFriendMutation({ onSuccess, onSettled }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userBlockId }: { userBlockId: number }) => {
      const res = await api.delete(`/api/v1/moderation/blocks/${userBlockId}`);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      // 차단 목록에 즉시 반영
      queryClient.setQueryData(
        ["currentUser", "friends", "blocked"],
        (oldData: BlockedFriendsRes) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            totalCount: oldData.totalCount! - 1,
            blockedUsers: oldData.blockedUsers?.filter(
              (user) => user.userBlockId !== variables.userBlockId,
            ),
          };
        },
      );
      // 차단 후 검색 결과 리셋
      queryClient.removeQueries({
        queryKey: ["currentUser", "friends", "searchResults"],
      });
      onSuccess?.();
    },
    onSettled: (data, error, variables) => {
      onSettled?.(data, error, variables);
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
