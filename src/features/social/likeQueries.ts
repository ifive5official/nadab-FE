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
import useModalStore from "@/store/modalStore";

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
    retry: (failureCount, error) => {
      // 열람 권한 없거나 데이터 없을 시 재시도 X
      const err = error as AxiosError<ApiErrResponse<null>>;
      const status = err.response?.status;

      if (status === 403 || status === 404) {
        return false;
      }

      return failureCount < 3;
    },
  });
}

// 게시글 좋아요
export function useLikeMutation() {
  const queryClient = useQueryClient();
  const { showError } = useModalStore();

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
      if (err.response?.data?.code === "SOCIAL_SUSPENDED") {
        showError("소셜 기능 사용이 일시 중단되었어요.");
      } else if (err.response?.data?.code === "AUTH_ACCESS_DENIED") {
        showError("친구가 아닌 유저의 게시글에 좋아요를 남길 수 없어요.");
      } else {
        handleDefaultApiError(err);
      }
    },
  });
}

// 게시글 좋아요 취소
export function useUnLikeMutation() {
  const queryClient = useQueryClient();
  const { showError } = useModalStore();

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
      if (err.response?.data?.code === "SOCIAL_SUSPENDED") {
        showError("소셜 기능 사용이 일시 중단되었어요.");
      } else {
        handleDefaultApiError(err);
      }
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
    retry: (failureCount, error) => {
      // 열람 권한 없거나 데이터 없을 시 재시도 X
      const err = error as AxiosError<ApiErrResponse<null>>;
      const status = err.response?.status;

      if (status === 403 || status === 404) {
        return false;
      }

      return failureCount < 3;
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
  const { showError } = useModalStore();

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
      if (err.response?.data?.code === "SOCIAL_SUSPENDED") {
        showError("소셜 기능 사용이 일시 중단되었어요.");
      } else if (err.response?.data?.code === "AUTH_ACCESS_DENIED") {
        showError("친구가 아닌 유저의 댓글에 좋아요를 남길 수 없어요.");
      } else if (
        err.response?.data?.code === "COMMENT_NOT_FOUND" ||
        err.response?.data?.code === "COMMENT_DELETED"
      ) {
        showError("이미 삭제된 댓글이에요.");
      } else {
        handleDefaultApiError(err);
      }
    },
  });
}

// 댓글 좋아요 취소
export function useCommentUnLikeMutation() {
  const queryClient = useQueryClient();
  const { showError } = useModalStore();

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
      if (err.response?.data?.code === "SOCIAL_SUSPENDED") {
        showError("소셜 기능 사용이 일시 중단되었어요.");
      } else {
        handleDefaultApiError(err);
      }
    },
  });
}
