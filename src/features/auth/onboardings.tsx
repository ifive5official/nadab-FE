// 온보딩에 쓰이는 화면들

import { QuestionBadge } from "@/components/Badges";
import { LeftCarousel, RightCarousel } from "@/components/Carousels";
import { CloseBigIcon, InfoIcon, NoticeMenuIcon } from "@/components/Icons";
import SpeechBalloon from "@/components/Speechballoon";

export function Question() {
  return (
    <div className="h-full max-h-[396px] w-full px-padding-x-m flex flex-col justify-evenly">
      {/* 토스트 */}
      <div className="rounded-full bg-surface-base border border-border-alpha px-padding-x-xs py-padding-y-xs flex gap-gap-x-s items-center">
        <NoticeMenuIcon />
        <div className="mr-auto">
          <p className="text-label-m">오늘의 질문이 도착했어요.</p>
          <p className="text-caption-s">답변을 작성해서 리포트를 받아보세요.</p>
        </div>
        <CloseBigIcon />
      </div>

      <SpeechBalloon
        textColor="var(--color-text-inverse-primary)"
        bgColor="var(--color-surface-layer-3)"
      >
        <div className="flex flex-col items-start gap-gap-y-s">
          <QuestionBadge category="LOVE" />
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

export function Report() {
  return (
    <div className="h-full max-h-[364px] w-full px-padding-x-xl flex flex-col items-center justify-evenly">
      <div className="w-full flex justify-between items-center">
        <div className="px-padding-x-s py-padding-y-xxs bg-brand-primary-alpha-70 text-button-primary-text-default text-button-3 rounded-full">
          전체 리포트
        </div>
        <div className="flex gap-margin-x-s">
          <LeftCarousel />
          <RightCarousel />
        </div>
      </div>
      <div className="w-full flex justify-between items-end">
        <p className="text-title-3">
          가나다라마바사님의
          <br />
          마음은 이렇게 변화했어요.
        </p>
        <InfoIcon className="px-padding-x-xs py-padding-x-xxs" />
      </div>
      <div className="rounded-2xl bg-surface-layer-1 border border-border-base px-padding-x-m py-padding-x-m flex flex-col gap-padding-y-xs">
        <p className="text-label-l">고민을 대하는 자세</p>
        <p className="text-body-2 text-text-secondary">
          고민을 회피 대신 직면하는 방식으로 크게 변화했어요. 이는 고민을 성장의
          질문으로 대하는 능동적인 나다움이 확립되었음으로 볼 수 있어요. 회피성
          키워드 사용량이 감소했고, 행동 계획 문장 비율이 25% 증가했답니다.
        </p>
      </div>
    </div>
  );
}
