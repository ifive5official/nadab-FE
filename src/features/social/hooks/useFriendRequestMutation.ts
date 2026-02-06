// 친구 요청 보내기
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiResponse, ApiErrResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = {
  onSuccess?: () => void;
  onSettled?: (
    data: any,
    error: any,
    variables: { receiverNickname: string },
  ) => void;
};

type Res = components["schemas"]["FriendshipResponse"];

export function useFriendRequestMutation({ onSuccess, onSettled }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["friendRequest"],
    mutationFn: async ({ receiverNickname }: { receiverNickname: string }) => {
      const res = await api.post<ApiResponse<Res>>("/api/v1/friends/requests", {
        receiverNickname,
      });
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
