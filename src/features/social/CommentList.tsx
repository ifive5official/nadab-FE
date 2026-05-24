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
import { commentsOptions, useDeleteCommentMutation } from "./commentQueries";
import { Fragment, useEffect, useState } from "react";
import CommentAccessoryView from "./CommentAccessoryView";
import { formatRelativeDate } from "@/lib/formatters";
import clsx from "clsx";
import { SubCommentList } from "./SubCommentList";
import { CommentMenu } from "./CommentMenu";
import { useNavigate } from "@tanstack/react-router";

type SubCommentTarget = {
  parentCommentId: number;
  parentCommentAuthorNickname: string;
  isParentCommentSecret: boolean;
};

export function CommentList({ dailyReportId }: { dailyReportId: number }) {
  const [subCommentTarget, setSubCommentTarget] =
    useState<SubCommentTarget | null>(null);

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
    <div className={clsx(subCommentTarget ? "pb-[104px]" : "pb-16")}>
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
                    onSubCommentClick={() =>
                      setSubCommentTarget({
                        parentCommentId: comment.commentId!,
                        parentCommentAuthorNickname: comment.authorNickname!,
                        isParentCommentSecret: comment.isSecret!,
                      })
                    }
                  />
                );
              })}
              {page.hasNext && <div ref={ref} className="absolute" />}
            </Fragment>
          );
        })}
        {(isLoading || isFetchingNextPage) && <CommentSkeleton />}
      </ul>
      <CommentAccessoryView
        dailyReportId={dailyReportId}
        parentCommentId={subCommentTarget?.parentCommentId}
        parentCommentAuthorNickname={
          subCommentTarget?.parentCommentAuthorNickname
        }
        isParentCommentSecret={subCommentTarget?.isParentCommentSecret}
        onResetSubCommentTarget={() => setSubCommentTarget(null)}
      />
    </div>
  );
}

type Comment = components["schemas"]["CommentResponse"];
type CommentProps = {
  dailyReportId: number;
  comment: Comment;
  parentCommentId?: number; // 대댓글이면 존재함
  onSubCommentClick?: () => void;
};
export function Comment({
  dailyReportId,
  comment,
  parentCommentId,
  onSubCommentClick,
}: CommentProps) {
  const navigate = useNavigate();
  const isSecret = !comment.canViewContent;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 댓글 관리
  const deleteCommentMutation = useDeleteCommentMutation();

  return (
    <li className="relative">
      <div className="flex gap-gap-x-l items-start">
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
            <button onClick={() => setIsMenuOpen(true)}>
              <MoreHorizontalIcon size={20} fill="var(--color-icon-muted)" />
            </button>
          </div>
          <p
            className={clsx("text-caption-l", isSecret && "text-text-tertiary")}
          >
            {isSecret ? "비밀 댓글이에요." : comment.content}
          </p>
          {!isSecret && !parentCommentId && (
            <button
              onClick={onSubCommentClick}
              className="text-caption-l underline"
            >
              답글 남기기
            </button>
          )}
        </div>
        <FeedHeartIcon />
      </div>
      <SubCommentList
        dailyReportId={dailyReportId}
        parentCommentId={comment.commentId!}
        initialCount={comment.visibleSubCommentCount ?? 0}
      />
      <CommentMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        canEdit={!!comment.isMine}
        canReport={!comment.isMine && !!comment.canViewContent}
        canDelete={comment.canDelete!}
        onEditClick={() => {
          // Todo
        }}
        onReportClick={() => {
          navigate({
            to: `/flag/comment/${comment.commentId!}`,
            search: {
              parentCommentId: parentCommentId,
            },
          });
        }}
        onDeleteClick={() =>
          deleteCommentMutation.mutate({
            commentId: comment.commentId!,
            dailyReportId,
            parentCommentId,
          })
        }
      />
    </li>
  );
}

type CommentSkeletonProps = {
  isSubComment?: boolean;
  repeat?: number;
};

export function CommentSkeleton({
  repeat = 5,
  isSubComment = false,
}: CommentSkeletonProps) {
  return (
    <>
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <li key={i} className="flex gap-gap-x-l items-start">
            <div className="aspect-square w-9 rounded-full flex items-center justify-center bg-surface-layer-3"></div>
            <div className="flex-1 flex flex-col items-start gap-1">
              <div className="flex gap-gap-x-s items-center w-20 h-5 bg-surface-layer-2 animate-pulse rounded-sm" />
              <p className="w-40 h-6 bg-surface-layer-2 animate-pulse rounded-sm" />
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
