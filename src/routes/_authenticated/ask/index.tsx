import { AppIcon } from "@/components/AppIcon";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { currentUserOptions, crystalsOptions } from "@/features/user/queries";
import { homeOptions } from "@/features/home/queries";
import { GemFilledIcon } from "@/components/Icons";
import categories from "@/constants/categories";
import {
  AskPageLayout,
  type AskInputController,
} from "@/features/ask/AskPageLayout";

export const Route = createFileRoute("/_authenticated/ask/")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(currentUserOptions),
      queryClient.ensureQueryData(crystalsOptions),
      queryClient.ensureQueryData(homeOptions),
    ]),
});

const PRESET_QUESTIONS = [
  {
    category: "VALUES",
    question: "나는 어떤 사람이야?",
  },
  {
    category: "PREFERENCE",
    question: "내가 좋아하는 것들의 공통점은 뭐야?",
  },
  {
    category: "RELATIONSHIP",
    question: "어떤 사람과 잘 맞을까?",
  },
] as const;

// 물어보기 화면의 기본 서브헤더 레이아웃을 렌더링합니다.
function RouteComponent() {
  const [{ data: currentUser }, { data: crystalData }, { data: homeData }] =
    useSuspenseQueries({
      queries: [currentUserOptions, crystalsOptions, homeOptions],
    });

  return (
    <AskPageLayout>
      {(input) => (
        <AskMainContent
          nickname={currentUser.nickname}
          recordCount={homeData.totalRecordDays ?? 0}
          crystals={crystalData.crystalBalance ?? 0}
          input={input}
        />
      )}
    </AskPageLayout>
  );
}

type AskMainContentProps = {
  nickname?: string;
  recordCount: number;
  crystals: number;
  input: AskInputController;
};

// 물어보기 화면의 안내와 프리셋 질문 목록을 세로로 보여줍니다.
function AskMainContent({
  nickname,
  recordCount,
  crystals,
  input,
}: AskMainContentProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-gap-y-xl py-padding-y-xl text-center">
      <section className="flex flex-col items-center gap-gap-y-m">
        <img
          src="/marble.webp"
          alt="수정구슬"
          className="size-16 rounded-full object-cover"
        />
        <div className="flex flex-col items-center gap-gap-y-xs">
          <p className="text-label-m text-text-secondary">{nickname} 님,</p>
          <p className="text-title-2 text-text-primary">
            오늘은 어떤 모습을 알아볼까요?
          </p>
          <p className="text-caption-s text-text-tertiary">
            <span className="font-bold">{recordCount}개의 기록</span>
            을 바탕으로 답변을 드려요.
          </p>
        </div>
        <AskCrystalBadge crystals={crystals} />
      </section>
      <section className="flex w-full flex-col gap-gap-y-l">
        <div className="grid w-full grid-cols-3 gap-gap-x-s">
          {PRESET_QUESTIONS.map((preset) => (
            <button
              key={preset.category}
              type="button"
              onClick={() => input.setValueAndFocus(preset.question)}
              className="flex min-w-0 flex-col items-start gap-gap-y-s rounded-2xl bg-surface-base px-padding-x-xs py-padding-y-s text-left shadow-1"
            >
              <AskQuestionBadge category={preset.category} />
              <span className="min-w-0 whitespace-normal break-words text-caption-m text-text-primary">
                {preset.question}
              </span>
            </button>
          ))}
        </div>
        <p className="flex items-center justify-center gap-gap-x-xs text-caption-s text-text-tertiary">
          <AppIcon name="bulb" size={16} color="muted" />
          <span>
            각 주제에{" "}
            <span className="font-bold">더 많이 답할 수록 더 깊은</span> 답을
            드려요.
          </span>
        </p>
      </section>
      {/* API 구현 전 대화 화면을 먼저 확인하기 위한 테스트 CTA입니다. */}
      <Link
        to="/ask/chat"
        className="rounded-full bg-button-primary-bg-default px-padding-x-l py-padding-y-s text-button-1 text-button-primary-text-default shadow-1"
      >
        대화 화면으로
      </Link>
    </div>
  );
}

type AskQuestionBadgeProps = {
  category: (typeof categories)[number]["code"];
};

// 물어보기 프리셋 카드 안에서 주제 이름을 작은 배지로 보여줍니다.
function AskQuestionBadge({ category }: AskQuestionBadgeProps) {
  const item = categories.find((c) => c.code === category)!;
  const Icon = item.icon;

  return (
    <div className="flex items-center justify-center gap-gap-x-xs rounded-lg border border-button-tertiary-border-default bg-surface-base px-padding-x-xxs py-padding-y-xs text-label-s text-button-tertiary-text-default">
      <Icon fill="var(--color-icon-primary)" />
      <span className="whitespace-nowrap">{item.title}</span>
    </div>
  );
}

type AskCrystalBadgeProps = {
  crystals: number;
};

// 물어보기 화면에서 surface/base 배경의 크리스탈 수량 배지를 보여줍니다.
function AskCrystalBadge({ crystals }: AskCrystalBadgeProps) {
  return (
    <div className="flex w-fit items-center gap-gap-x-xs rounded-full bg-surface-base px-padding-x-xs py-padding-y-xs text-text-primary dark:bg-surface-layer-1">
      <GemFilledIcon />
      <span className="text-caption-s">{crystals}</span>
    </div>
  );
}
