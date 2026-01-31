// 친구 요청 수락
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = {
  onSettled?: (
    data: any,
    error: any,
    variables: { friendshipId: number },
  ) => void;
};

export function useAcceptFriendRequestMutation({ onSettled }: Props) {
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
      return await queryClient.invalidateQueries({
        queryKey: ["currentUser", "friends"],
      });
    },
    onSettled: (data, error, variables) => {
      onSettled?.(data, error, variables);
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
