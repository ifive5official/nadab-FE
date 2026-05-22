// 댓글 목록
import {
  FeedHeartIcon,
  LockFilledIcon,
  MoreHorizontalIcon,
} from "@/components/Icons";
import ProfileImg from "@/components/ProfileImg";
import type { components } from "@/generated/api-types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { commentsOptions } from "./commentQueries";
import { Fragment, useEffect } from "react";
import CommentAccessoryView from "./CommentAccessoryView";
import { formatRelativeDate } from "@/lib/formatters";
import clsx from "clsx";

export function CommentList({ dailyReportId }: { dailyReportId: number }) {
  // 무한스크롤
  const { ref, inView } = useInView();
  const {
    data: commentsData,
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

  return (
    <div className="pb-[calc(64px+var(--safe-bottom))]">
      <ul className="flex flex-col gap-gap-y-xl">
        {commentsData?.pages.map((page, i) => {
          return (
            <Fragment key={i}>
              {page?.comments?.map((comment) => {
                return <Comment key={comment.commentId} comment={comment} />;
              })}
              {page.hasNext && <div ref={ref} className="absolute" />}
            </Fragment>
          );
        })}
        {(isLoading || isFetchingNextPage) && <CommentSkeleton />}
      </ul>
      <CommentAccessoryView dailyReportId={dailyReportId} />
    </div>
  );
}

type Comment = components["schemas"]["CommentResponse"];
export function Comment({ comment }: { comment: Comment }) {
  const isSecret = !comment.canViewContent;
  return (
    <li className="flex gap-gap-x-l items-start">
      {isSecret ? (
        <div className="aspect-square w-9 rounded-full flex items-center justify-center bg-surface-layer-3">
          <LockFilledIcon />
        </div>
      ) : (
        <ProfileImg width={36} src={comment.authorProfileImageUrl} />
      )}
      <div className="flex-1 flex flex-col items-start gap-1">
        <div className="flex gap-gap-x-s items-center">
          <span className="text-button-2">
            {isSecret ? "이름 없는 친구" : comment.authorNickname}
          </span>
          <span className="text-caption-m text-text-tertiary">
            {formatRelativeDate(comment.createdAt!)}
          </span>
          <button>
            <MoreHorizontalIcon size={20} fill="var(--color-icon-muted)" />
          </button>
        </div>
        <p className={clsx("text-caption-l", isSecret && "text-text-tertiary")}>
          {isSecret ? "비밀 댓글이에요." : comment.content}
        </p>
        <button className="text-caption-l underline">답글 남기기</button>
      </div>
      <FeedHeartIcon />
    </li>
  );
}

export function CommentSkeleton() {
  return (
    <>
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <li key={i} className="flex gap-gap-x-l items-start">
            <div className="aspect-square w-9 rounded-full flex items-center justify-center bg-surface-layer-3"></div>
            <div className="flex-1 flex flex-col items-start gap-1">
              <div className="flex gap-gap-x-s items-center w-20 h-5 bg-surface-layer-2 animate-pulse rounded-sm" />
              <p className="w-40 h-6 bg-surface-layer-2 animate-pulse rounded-sm" />
              <button className="text-caption-l underline text-text-disabled">
                답글 남기기
              </button>
            </div>
            <FeedHeartIcon />
          </li>
        ))}
    </>
  );
}
