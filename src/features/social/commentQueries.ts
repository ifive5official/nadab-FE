// 댓글 기능 관련 쿼리 및 훅
import {
  infiniteQueryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";
import type { AxiosError } from "axios";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type CommentRes = components["schemas"]["CommentListResponse"];
type CreateCommentReq = components["schemas"]["CreateCommentRequest"];
type CreateSubCommentReq = components["schemas"]["CreateSubCommentRequest"];

// 게시글 댓글 리스트
export function commentsOptions(dailyReportId: number) {
  return infiniteQueryOptions({
    queryKey: ["currentUser", "comments", dailyReportId],
    queryFn: async ({ pageParam }) => {
      const res = await api.get<ApiResponse<CommentRes>>("/api/v1/comments", {
        params: { dailyReportId, cursor: pageParam || undefined },
      });

      return res.data.data!;
    },
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : null,
  });
}

// 댓글 작성
export function usePostCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (req: CreateCommentReq) => {
      const res = await api.post(`/api/v1/comments`, req);
      return res.data;
    },
    onSuccess: async (_, variables) => {
      // 댓글 작성 후 댓글 목록 재조회
      const { dailyReportId } = variables;
      const queryKey = ["currentUser", "comments", dailyReportId];
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}

// 대댓글 목록 조회
// commentId는 부모 댓글 id임
export function subCommentOptions(commentId: number, isExpended: boolean) {
  return infiniteQueryOptions({
    queryKey: ["currentUser", "subComments", commentId],
    queryFn: async ({ pageParam }) => {
      const res = await api.get<ApiResponse<CommentRes>>(
        `/api/v1/comments/${commentId}/sub-comments`,
        {
          params: { cursor: pageParam || undefined },
        },
      );

      return res.data.data!;
    },
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : null,
    enabled: isExpended,
  });
}

// 대댓글 작성
// commentId는 부모 댓글 id임
export function usePostSubCommentMutation(commentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (req: CreateSubCommentReq) => {
      const res = await api.post(
        `/api/v1/comments/${commentId}/sub-comments`,
        req,
      );
      return res.data;
    },
    onSuccess: async () => {
      // 대댓글 작성 후 대댓글 목록 재조회
      const queryKey = ["currentUser", "subComments", commentId];
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
