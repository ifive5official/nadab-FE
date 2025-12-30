// 온보딩에 쓰이는 화면들

import { QuestionBadge } from "@/components/Badges";
import { CloseBigIcon, NoticeMenuIcon } from "@/components/Icons";
import SpeechBalloon from "@/components/Speechballoon";

export function Question() {
  return (
    <div className="h-full w-full px-padding-x-m flex flex-col justify-evenly">
      {/* 토스트 */}
      <div className="rounded-full bg-surface-base border border-border-alpha px-padding-x-xs py-padding-y-xs flex gap-gap-x-s items-center">
        <NoticeMenuIcon />
        <div className="mr-auto">
          <p className="text-label-m">오늘의 질문이 도착했어요.</p>
          <p className="text-caption-s">답변을 작성해서 분석을 받아보세요.</p>
        </div>
        <CloseBigIcon />
      </div>

      <SpeechBalloon
        textColor="var(--color-text-inverse-primary)"
        bgColor="var(--color-surface-layer-3)"
      >
        <div className="flex flex-col items-start gap-2.5">
          <QuestionBadge category="사랑" />
          <p>
            가나다라님의
            <br />
            설렘의 순간은 언제였나요?
          </p>
        </div>
      </SpeechBalloon>
      <SpeechBalloon
        textColor="var(--color-text-inverse-primary)"
        bgColor="var(--color-surface-layer-3)"
      >
        같은 질문에 7명의 친구가 답변했어요!
      </SpeechBalloon>
      <SpeechBalloon
        direction="send"
        textColor="var(--color-text-primary)"
        bgColor="var(--color-surface-layer-1)"
      >
        당신이 설렘의 순간을 ‘작고 조용한 것’이라고 정의한 건, 강한 감정
        소모보다 통제 가능한 감정을 선호하기 때문이에요.
      </SpeechBalloon>
    </div>
  );
}
