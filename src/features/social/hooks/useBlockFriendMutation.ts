// 친구 차단
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type Props = {
  onSuccess?: () => void;
};

export function useBlockFriendMutation({ onSuccess }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ blockedNickname }: { blockedNickname: string }) => {
      const res = await api.post("/api/v1/moderation/blocks", {
        blockedNickname,
      });
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["currentUser", "friends"],
      });
      onSuccess?.();
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
