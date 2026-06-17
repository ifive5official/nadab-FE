// 댓글 목록
import { FeedHeartIcon, WarningFilledIcon } from "@/components/Icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { commentsOptions } from "./commentQueries";
import { Fragment, useEffect } from "react";
import CommentAccessoryView from "./CommentAccessoryView";
import clsx from "clsx";
import useCommentInputStore from "@/store/commentInputStore";
import { Comment } from "./Comment";
import { useRouter } from "@tanstack/react-router";
import useModalStore from "@/store/modalStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";

type Props = {
  dailyReportId: number;
  readOnly?: boolean;
};

export function CommentList({ dailyReportId, readOnly = false }: Props) {
  const { mode, setWriteMode } = useCommentInputStore();

  const router = useRouter();
  const { showModal, closeModal } = useModalStore();

  // 무한스크롤
  const { ref, inView } = useInView();
  const {
    data: commentsData,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(commentsOptions(dailyReportId));

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // 에러 띄우기
  useEffect(() => {
    if (error) {
      const err = error as AxiosError<ApiErrResponse<null>>;
      const code = err.response?.data?.code;
      const message =
        code === "AUTH_ACCESS_DENIED"
          ? "댓글 열람 권한이 없어요."
          : "존재하지 않는 게시글이에요.";

      showModal({
        icon: WarningFilledIcon,
        title: message,
        buttons: [
          {
            label: "확인",
            onClick: () => {
              closeModal();
              router.history.back();
            },
          },
        ],
      });
    }
  }, [error, showModal, closeModal, router.history]);

  // 댓글 초기화
  useEffect(() => {
    setWriteMode(dailyReportId);
    return () => setWriteMode(dailyReportId);
  }, [setWriteMode, dailyReportId]);

  return (
    <div
      className={clsx(readOnly ? "" : mode === "SUB" ? "pb-[104px]" : "pb-16")}
    >
      <ul className="flex flex-col gap-gap-y-xl">
        {commentsData?.pages.map((page, i) => {
          return (
            <Fragment key={i}>
              {page?.comments?.map((comment) => {
                return (
                  <Comment
                    key={comment.commentId}
                    dailyReportId={dailyReportId}
                    comment={comment}
                  />
                );
              })}
              {page.hasNext && <div ref={ref} className="-mt-gap-y-xl" />}
            </Fragment>
          );
        })}
        {(isLoading || isFetchingNextPage) && <CommentListSkeleton />}
      </ul>
      {!readOnly && <CommentAccessoryView />}
    </div>
  );
}

type CommentListSkeletonProps = {
  isSubComment?: boolean;
  repeat?: number;
};

export function CommentListSkeleton({
  repeat = 5,
  isSubComment = false,
}: CommentListSkeletonProps) {
  return (
    <>
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <li key={i} className="flex gap-gap-x-l items-start">
            <div className="aspect-square w-9 rounded-full flex items-center justify-center bg-surface-layer-2 dark:bg-surface-layer-3"></div>
            <div className="flex-1 flex flex-col items-start gap-1">
              <div className="flex gap-gap-x-s items-center w-20 h-5 bg-surface-layer-2 dark:bg-surface-layer-3 animate-pulse rounded-sm" />
              <p className="w-40 h-6 bg-surface-layer-2 dark:bg-surface-layer-3 animate-pulse rounded-sm" />
              {!isSubComment && (
                <button className="text-caption-l underline text-text-disabled">
                  답글 남기기
                </button>
              )}
            </div>
            <FeedHeartIcon />
          </li>
        ))}
    </>
  );
}
