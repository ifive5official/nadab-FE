// SubCommentList.tsx
import { useInfiniteQuery } from "@tanstack/react-query";
import { subCommentOptions } from "./commentQueries";
import { Fragment, useState } from "react";
import { Comment, CommentSkeleton } from "./CommentList";

type SubCommentListProps = {
  parentCommentId: number;
  initialCount: number; // 부모 댓글에서 내려준 visibleSubCommentCount
};

export function SubCommentList({
  parentCommentId,
  initialCount,
}: SubCommentListProps) {
  const [isExpanded, setIsExpanded] = useState(false); // 대댓글이 열렸는가
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(subCommentOptions(parentCommentId, isExpanded));

  const loadedCount =
    data?.pages.reduce((sum, page) => sum + (page.comments?.length || 0), 0) ||
    0;
  const remainingCount = initialCount - loadedCount;

  // 대댓글이 아예 없으면 아무것도 그리지 않음
  if (initialCount === 0) return null;

  return (
    <div className="ml-9 pl-gap-x-l">
      {isExpanded && (
        <ul className="mt-gap-y-m flex flex-col gap-gap-y-l">
          {data?.pages.map((page, i) => (
            <Fragment key={i}>
              {page.comments?.map((subComment) => (
                // 기존 Comment UI를 재사용하되, 필요 시 대댓글용 스타일이나 분기를 처리합니다.
                <Comment
                  key={subComment.commentId}
                  comment={subComment}
                  isSubComment={true}
                />
              ))}
            </Fragment>
          ))}
          {(isLoading || isFetchingNextPage) && (
            <CommentSkeleton repeat={3} isSubComment={true} />
          )}
        </ul>
      )}

      {/* 더보기 버튼 */}
      {(loadedCount === 0 || hasNextPage) &&
        !(isLoading || isFetchingNextPage) && (
          <button
            className="mt-gap-y-s flex gap-gap-x-s items-center"
            onClick={() => {
              if (!isExpanded) {
                setIsExpanded(true);
              } else {
                fetchNextPage();
              }
            }}
            disabled={isFetchingNextPage}
          >
            <div className="h-px w-7 bg-border-layer-1" />
            <span className="text-caption-l text-text-tertiary">
              {loadedCount === 0
                ? `댓글 ${initialCount}개 더 보기`
                : `댓글 ${remainingCount}개 더 보기`}
            </span>
          </button>
        )}
    </div>
  );
}
