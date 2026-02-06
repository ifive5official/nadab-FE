// 친구 요청 거절
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = {
  onSuccess?: () => void;
  onSettled?: (
    data: any,
    error: any,
    variables: { friendshipId: number },
  ) => void;
};

export function useRejectFriendRequestMutation({
  onSuccess,
  onSettled,
}: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ friendshipId }: { friendshipId: number }) => {
      const res = await api.post(
        `/api/v1/friends/requests/${friendshipId}/reject`,
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
      handleDefaultApiError(err);
    },
  });
}
