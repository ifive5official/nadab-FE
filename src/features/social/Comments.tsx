// 댓글 하나
import { FeedHeartIcon } from "@/components/Icons";
import ProfileImg from "@/components/ProfileImg";
import type { components } from "@/generated/api-types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { commentsOptions } from "./commentQueries";
import { Fragment, useEffect } from "react";
import CommentAccessoryView from "./CommentAccessoryView";

export function CommentList({ dailyReportId }: { dailyReportId: number }) {
  // 무한스크롤
  const { ref, inView } = useInView();
  const {
    data: commentsData,
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
    <div>
      <ul>
        {commentsData?.pages.map((page, i) => {
          return (
            <Fragment key={i}>
              {page?.comments?.map((comment) => {
                return <Comment key={comment.commentId} comment={comment} />;
              })}
            </Fragment>
          );
        })}
      </ul>
      {isFetchingNextPage && <div>로딩중</div>}
      <div ref={ref} />
      <CommentAccessoryView />
    </div>
  );
}

type Comment = components["schemas"]["CommentResponse"];
export function Comment({ comment }: { comment: Comment }) {
  return (
    <li>
      <ProfileImg width={36} src={comment.authorProfileImageUrl} />
      <div>
        <div>
          <span>{comment.authorNickname}</span>
          <span>{comment.createdAt}</span>
          <FeedHeartIcon />
        </div>
        <p>{comment.content}</p>
        <button>답글 남기기</button>
      </div>
    </li>
  );
}
