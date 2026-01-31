import { EmotionBadge, QuestionBadge } from "@/components/Badges";
import { useState, useRef, useLayoutEffect } from "react";
import clsx from "clsx";
import type { components } from "@/generated/api-types";
import ProfileImg from "@/components/ProfileImg";
import type categories from "@/constants/categories";
import type emotions from "@/constants/emotions";

type Props = {
  feed: components["schemas"]["FeedResponse"];
};

export default function Post({ feed }: Props) {
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

  return (
    <section className="px-padding-x-m py-padding-y-m rounded-2xl bg-surface-layer-1 border border-border-base shadow-1">
      <div className="flex items-center gap-margin-x-s">
        <ProfileImg width={35} src={feed.friendProfileImageUrl} />
        <span className="text-button-1">{feed.friendNickname}</span>
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
      <div className="flex flex-col px-padding-x-m py-padding-y-m bg-interactive-bg-default rounded-2xl border border-border-base overflow-hidden">
        <EmotionBadge
          emotion={feed.emotionCode as (typeof emotions)[number]["code"]}
          filled
          className="mr-auto mb-padding-y-xs"
        />
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
            className="text-body-2 text-text-secondary ml-auto mt-margin-y-xs"
          >
            {isAnswerOpen ? "접기" : "더보기"}
          </button>
        )}
      </div>
    </section>
  );
}
