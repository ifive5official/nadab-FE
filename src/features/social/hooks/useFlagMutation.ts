// 게시글 신고
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type Props = {
  onSuccess?: () => void;
};

export function useFlagMutation({ onSuccess }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dailyReportId,
      reason,
      customReason,
    }: {
      dailyReportId: number;
      reason: string;
      customReason: string;
    }) => {
      const req =
        reason === "OTHER"
          ? {
              dailyReportId,
              reason,
              customReason,
            }
          : {
              dailyReportId,
              reason,
            };
      const res = await api.post("/api/v1/moderation/reports", req);
      return res.data;
    },
    onSuccess: async () => {
      // 신고 후 피드 리셋
      await queryClient.resetQueries({
        queryKey: ["currentUser", "feeds"],
      });
      onSuccess?.();
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
