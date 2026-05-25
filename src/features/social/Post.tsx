// 피드에 보이는 게시글 하나
import { EmotionBadge, QuestionBadge } from "@/components/Badges";
import { useState, useRef, useLayoutEffect } from "react";
import clsx from "clsx";
import type { components } from "@/generated/api-types";
import ProfileImg from "@/components/ProfileImg";
import type categories from "@/constants/categories";
import type emotions from "@/constants/emotions";
import { FeedMessageIcon, MoreHorizontalIcon } from "@/components/Icons";
import useBottomModalStore from "@/store/bottomModalStore";
import { useNavigate } from "@tanstack/react-router";
import AnswerImage from "@/components/AnswerImage";
import CommentInput from "./CommentInput";
import useBottomSheetStore from "@/store/bottomSheetStore";
import {
  likesOptions,
  useLikeMutation,
  useUnLikeMutation,
} from "./likeQueries";
import { useLongPress } from "@/hooks/useLongPress";
import { CommentList } from "./CommentList";
import { LikeUserList } from "./LikeUserList";
import { LikeButton } from "./LikeButton";

type Props = {
  feed: components["schemas"]["FeedResponse"];
  isMine?: boolean; // 내 게시물인지 친구 게시물인지
  className?: string;
};

export default function Post({ feed, isMine = false, className }: Props) {
  const { showBottomModal, closeBottomModal } = useBottomModalStore();
  const { showBottomSheet } = useBottomSheetStore();
  const navigate = useNavigate();

  // 내용이 길 시 더보기 처리
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false); // 텍스트가 넘치는가?
  const answerRef = useRef<HTMLParagraphElement>(null);

  // 더보기 버튼 여부 처리 위해 답변 높이 측정
  useLayoutEffect(() => {
    const checkOverflow = () => {
      const element = answerRef.current;
      if (element) {
        setIsOverflowing(element.scrollHeight > element.clientHeight);
      }
    };

    checkOverflow();
  }, []);

  // 좋아요
  const likeMutation = useLikeMutation();
  const unLikeMutation = useUnLikeMutation();

  function handleClickLike() {
    // 남의 게시글만 짧게 누를 시 좋아요 가능
    if (isMine) return;

    if (feed.isLiked) {
      unLikeMutation.mutate({
        dailyReportId: feed.dailyReportId!,
      });
    } else {
      likeMutation.mutate({
        dailyReportId: feed.dailyReportId!,
      });
    }
  }

  function handleLongPressLike() {
    // 내 게시물에서만 길게 누를 시 좋아요 목록 확인 가능
    if (!isMine) return;
    showBottomSheet({
      title: "좋아요",
      content: (
        <LikeUserList
          queryOptions={likesOptions(feed.dailyReportId!, isMine)}
        />
      ),
    });
  }

  const likeEvent = useLongPress(handleLongPressLike, handleClickLike);

  return (
    <section
      className={clsx(
        "px-padding-x-m py-padding-y-m rounded-2xl bg-surface-layer-1 border border-border-base shadow-1",
        className,
      )}
    >
      <div className="flex items-center gap-margin-x-s">
        <ProfileImg width={35} src={feed.friendProfileImageUrl} />
        <span className="text-button-1 mr-auto">{feed.friendNickname}</span>
        {!isMine && (
          <button
            onClick={() =>
              showBottomModal({
                title: "게시글 신고",
                items: [
                  {
                    label: "신고",
                    type: "warning",
                    onClick: () => {
                      closeBottomModal();
                      navigate({ to: `/flag/report/${feed.dailyReportId}` });
                    },
                  },
                ],
              })
            }
          >
            <MoreHorizontalIcon />
          </button>
        )}
      </div>
      <div className="border-b border-b-surface-layer-2 my-margin-y-m" />
      <div className="flex justify-start">
        <QuestionBadge
          category={feed.interestCode as (typeof categories)[number]["code"]}
        />
      </div>
      <p className="text-title-3 mt-margin-y-s mb-margin-y-l">
        {feed.questionText}
      </p>
      <div className="flex flex-col gap-padding-y-s px-padding-x-m py-padding-y-m bg-interactive-bg-default rounded-2xl border border-border-base overflow-hidden">
        <EmotionBadge
          emotion={feed.emotionCode as (typeof emotions)[number]["code"]}
          filled
          className="mr-auto mb-padding-y-xs"
        />
        {feed.imageUrl && <AnswerImage imageUrl={feed.imageUrl} />}
        <p
          ref={answerRef}
          className={clsx(
            "text-body-2 text-text-secondary",
            !isAnswerOpen && "line-clamp-2",
          )}
        >
          {feed.answer}
        </p>
        {isOverflowing && (
          <button
            onClick={() => setIsAnswerOpen((prev) => !prev)}
            className="text-body-2 text-text-secondary ml-auto"
          >
            {isAnswerOpen ? "접기" : "더보기"}
          </button>
        )}
      </div>
      <div className="w-full h-10 flex gap-gap-x-l items-center mt-margin-y-m">
        {!isMine && (
          <CommentInput
            readOnly
            onClick={() =>
              showBottomSheet({
                title: "댓글",
                content: <CommentList dailyReportId={feed.dailyReportId!} />,
              })
            }
          />
        )}
        <div className="flex gap-gap-x-m">
          <LikeButton
            isLiked={!!(feed.isLiked || (isMine && feed.hasLikes))}
            isMine={isMine}
            likeEvent={likeEvent}
          />
          <button
            onClick={() =>
              showBottomSheet({
                title: "댓글",
                content: <CommentList dailyReportId={feed.dailyReportId!} />,
              })
            }
          >
            <FeedMessageIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
