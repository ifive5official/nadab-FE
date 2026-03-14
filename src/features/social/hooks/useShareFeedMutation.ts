// 오늘의 기록 친구와 공유하기
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";
import useModalStore from "@/store/modalStore";
import type { components } from "@/generated/api-types";

type Res = components["schemas"]["ShareStartResponse"];

type Props = {
  onSuccess?: (status: "SHARED" | "SUSPENDED") => void;
};

export function useShareFeedMutation({ onSuccess }: Props) {
  const { showError } = useModalStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<Res>>("/api/v1/feed/share");
      return res.data;
    },
    onSuccess: (data) => {
      onSuccess?.(data?.data?.status ?? "SHARED");
      queryClient.setQueryData(["currentUser", "feedShareStatus"], {
        isShared: true,
      });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      if (err.response?.data?.code === "DAILY_REPORT_NOT_FOUND") {
        showError(
          "아직 오늘의 질문에 답하지 않았어요.",
          "오늘의 질문에 답하고 친구들과 공유해보세요.",
        );
      } else {
        handleDefaultApiError(err);
      }
    },
  });
}
