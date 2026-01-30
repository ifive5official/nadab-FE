// 오늘의 기록 친구와 공유하기
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";

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
      useErrorStore.getState().showError(
        // Todo: 에러 메시지 변경
        err.response?.data?.code ?? err.message,
        err.response?.data?.message ??
          "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요.",
      );
    },
  });
}
