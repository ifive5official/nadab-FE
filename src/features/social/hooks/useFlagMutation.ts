// 게시글 신고
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";
import type { components } from "@/generated/api-types";

type Props = {
  onSuccess?: () => void;
};

type ReportReq = components["schemas"]["ReportContentRequest"];
interface ExtendedReportReq extends ReportReq {
  parentCommentId?: number;
}

export function useFlagMutation({ onSuccess }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dailyReportId,
      commentId,
      reason,
      customReason,
    }: ExtendedReportReq) => {
      const req: any = { reason };
      if (reason === "OTHER" && customReason) {
        req.customReason = customReason;
      }
      if (dailyReportId) {
        req.dailyReportId = dailyReportId;
      } else if (commentId) {
        req.commentId = commentId;
      }

      const res = await api.post("/api/v1/moderation/reports", req);
      return res.data;
    },
    onSuccess: async (_, variables) => {
      const { dailyReportId, commentId, parentCommentId } = variables;
      if (dailyReportId) {
        // 신고 후 피드 리셋
        await queryClient.resetQueries({
          queryKey: ["currentUser", "feeds"],
        });
      } else if (commentId) {
        // 신고 후 댓글 리셋
        if (parentCommentId) {
          // 대댓글의 경우
          queryClient.invalidateQueries({
            queryKey: ["currentUser", "subComments", parentCommentId],
          });
          queryClient.invalidateQueries({
            queryKey: ["currentUser", "comments", dailyReportId],
          });
        } else {
          // 일반 댓글의 경우
          queryClient.invalidateQueries({
            queryKey: ["currentUser", "comments", dailyReportId],
          });
        }
      }
      onSuccess?.();
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
