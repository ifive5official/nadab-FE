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
export function subCommentOptions(commentId: number, hasFetched: boolean) {
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
    enabled: hasFetched,
  });
}

interface ExtendedCreateSubCommentReq extends CreateSubCommentReq {
  commentId: number;
  dailyReportId: number;
}

// 대댓글 작성
// commentId는 부모 댓글 id임
export function usePostSubCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      isSecret,
      commentId,
    }: ExtendedCreateSubCommentReq) => {
      const req: CreateSubCommentReq = {
        content: content,
        isSecret: isSecret,
      };
      const res = await api.post(
        `/api/v1/comments/${commentId}/sub-comments`,
        req,
      );
      return res.data;
    },
    onSuccess: async (_, variables) => {
      const { commentId, dailyReportId } = variables;
      // 대댓글 작성 후 대댓글 목록 재조회
      const queryKey = ["currentUser", "subComments", commentId];
      queryClient.invalidateQueries({ queryKey });
      // 대댓글 작성 후 부모의 대댓글 수 재조회
      queryClient.invalidateQueries({
        queryKey: ["currentUser", "comments", dailyReportId],
      });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}

// 댓글 삭제
type DeleteCommentParams = {
  commentId: number; // 삭제할 댓글 id
  dailyReportId: number;
  parentCommentId?: number | null; // 대댓글일 경우만
};

export function useDeleteCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId }: DeleteCommentParams) => {
      const res = await api.delete(`/api/v1/comments/${commentId}`);
      return res.data;
    },
    onSuccess: async (_, variables) => {
      const { dailyReportId, parentCommentId } = variables;
      if (parentCommentId) {
        // 대댓글을 삭제한 경우
        // 해당 대댓글 리스트 새로고침
        queryClient.invalidateQueries({
          queryKey: ["currentUser", "subComments", parentCommentId],
        });
        //  부모 댓글의 대댓글 개수가 줄어들어야 하므로 전체 댓글 리스트도 새로고침
        queryClient.invalidateQueries({
          queryKey: ["currentUser", "comments", dailyReportId],
        });
      } else {
        // 일반 댓글을 삭제한 경우
        // 전체 댓글 리스트 새로고침
        queryClient.invalidateQueries({
          queryKey: ["currentUser", "comments", dailyReportId],
        });
      }
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
