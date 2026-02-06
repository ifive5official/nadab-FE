// 오늘의 기록 공유 중단
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type Props = {
  onSuccess?: () => void;
};

export function useUnshareFeedMutation({ onSuccess }: Props) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/v1/feed/unshare");
      return res.data;
    },
    onSuccess: () => {
      onSuccess?.();
      queryClient.setQueryData(["currentUser", "feedShareStatus"], {
        isShared: false,
      });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
