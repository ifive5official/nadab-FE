// 오늘의 기록 친구와 공유하기
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type Props = {
  onSuccess?: () => void;
};

export function useShareFeedMutation({ onSuccess }: Props) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/v1/feed/share");
      return res.data;
    },
    onSuccess: () => {
      onSuccess?.();
      queryClient.setQueryData(["currentUser", "feedShareStatus"], {
        isShared: true,
      });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
