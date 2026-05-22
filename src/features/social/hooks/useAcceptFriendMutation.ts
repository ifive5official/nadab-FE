// 친구 요청 수락
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";
import useModalStore from "@/store/modalStore";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = {
  onSuccess?: () => void;
  onSettled?: (
    data: any,
    error: any,
    variables: { friendshipId: number },
  ) => void;
};

export function useAcceptFriendRequestMutation({
  onSuccess,
  onSettled,
}: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ friendshipId }: { friendshipId: number }) => {
      const res = await api.post(
        `/api/v1/friends/requests/${friendshipId}/accept`,
        {
          friendshipId,
        },
      );
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["currentUser", "friends"],
      });
      onSuccess?.();
    },
    onSettled: (data, error, variables) => {
      onSettled?.(data, error, variables);
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      if (err.response?.data?.code === `FRIEND_LIMIT_EXCEEDED`) {
        useModalStore
          .getState()
          .showError(`친구는 최대 20명까지\n추가할 수 있어요.`);
      } else {
        handleDefaultApiError(err);
      }
    },
  });
}
