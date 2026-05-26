// 좋아요 기능 관련 쿼리 및 훅
import {
  queryOptions,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";
import type { AxiosError } from "axios";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type FeedsRes = components["schemas"]["FeedListResponse"];
type Feed = components["schemas"]["FeedResponse"];
type LikeRes = components["schemas"]["LikeListResponse"];

// 게시글 좋아요 리스트
export function likesOptions(dailyReportId: number) {
  return queryOptions({
    queryKey: ["currentUser", "likes", dailyReportId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<LikeRes>>(
        `/api/v1/feed/${dailyReportId}/likes`,
      );
      return res.data.data!;
    },
  });
}

// 게시글 좋아요
export function useLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dailyReportId }: { dailyReportId: number }) => {
      const res = await api.post(`/api/v1/feed/${dailyReportId}/likes`);
      return res.data;
    },
    onSuccess: async (_, variables) => {
      // 좋아요 후 해당 게시글 좋아요 처리
      const { dailyReportId } = variables;
      const queryKey = ["currentUser", "feeds"];

      queryClient.setQueryData(queryKey, (oldData: FeedsRes) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          feeds: oldData.feeds?.map((feed: Feed) =>
            feed.dailyReportId === dailyReportId
              ? { ...feed, isLiked: true }
              : feed,
          ),
        };
      });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}

// 게시글 좋아요 취소
export function useUnLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dailyReportId }: { dailyReportId: number }) => {
      const res = await api.delete(`/api/v1/feed/${dailyReportId}/likes`);
      return res.data;
    },
    onSuccess: async (_, variables) => {
      // 좋아요 후 해당 게시글 좋아요 취소 처리
      const { dailyReportId } = variables;
      const queryKey = ["currentUser", "feeds"];

      queryClient.setQueryData(queryKey, (oldData: FeedsRes) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          feeds: oldData.feeds?.map((feed: Feed) =>
            feed.dailyReportId === dailyReportId
              ? { ...feed, isLiked: false }
              : feed,
          ),
        };
      });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}

// 댓글 좋아요 리스트
export function commentLikesOptions(commentId: number) {
  return queryOptions({
    queryKey: ["currentUser", "likes", commentId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<LikeRes>>(
        `/api/v1/comments/${commentId}/likes`,
      );
      return res.data.data!;
    },
  });
}

type CommentRes = components["schemas"]["CommentListResponse"];

type ExtendedCommentReq = {
  commentId: number;
  dailyReportId?: number;
  parentCommentId?: number;
};

// 댓글 좋아요
export function useCommentLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId }: ExtendedCommentReq) => {
      const res = await api.post(`/api/v1/comments/${commentId}/likes`);
      return res.data;
    },
    onSuccess: async (_, variables) => {
      const { commentId, dailyReportId, parentCommentId } = variables;

      if (!parentCommentId && dailyReportId) {
        queryClient.setQueryData<InfiniteData<CommentRes>>(
          ["currentUser", "comments", dailyReportId],
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                comments: page.comments?.map((comment) =>
                  comment.commentId === commentId
                    ? {
                        ...comment,
                        isLiked: !comment.isLiked,
                      }
                    : comment,
                ),
              })),
            };
          },
        );
      }
      if (parentCommentId) {
        queryClient.setQueryData<InfiniteData<CommentRes>>(
          ["currentUser", "subComments", parentCommentId],
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                comments: page.comments?.map((comment) =>
                  comment.commentId === commentId
                    ? {
                        ...comment,
                        isLiked: !comment.isLiked,
                      }
                    : comment,
                ),
              })),
            };
          },
        );
      }
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}

// 댓글 좋아요 취소
export function useCommentUnLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId }: ExtendedCommentReq) => {
      const res = await api.delete(`/api/v1/comments/${commentId}/likes`);
      return res.data;
    },
    onSuccess: async (_, variables) => {
      const { commentId, dailyReportId, parentCommentId } = variables;
      if (!parentCommentId && dailyReportId) {
        queryClient.setQueryData<InfiniteData<CommentRes>>(
          ["currentUser", "comments", dailyReportId],
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                comments: page.comments?.map((comment) =>
                  comment.commentId === commentId
                    ? {
                        ...comment,
                        isLiked: !comment.isLiked,
                      }
                    : comment,
                ),
              })),
            };
          },
        );
      }
      if (parentCommentId) {
        queryClient.setQueryData<InfiniteData<CommentRes>>(
          ["currentUser", "subComments", parentCommentId],
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                comments: page.comments?.map((comment) =>
                  comment.commentId === commentId
                    ? {
                        ...comment,
                        isLiked: !comment.isLiked,
                      }
                    : comment,
                ),
              })),
            };
          },
        );
      }
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
