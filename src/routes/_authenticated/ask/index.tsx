import { AppIcon } from "@/components/AppIcon";
import {
  Link,
  createFileRoute,
  useNavigate,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { GemFilledIcon } from "@/components/Icons";
import { findCategoryByCode } from "@/constants/categories";
import {
  AskPageLayout,
  type AskInputController,
} from "@/features/ask/AskPageLayout";
import { askChatHomeOptions, type AskChatHome } from "@/features/ask/queries";
import { useStartAskChatSessionMutation } from "@/features/ask/useStartAskChatSessionMutation";
import { isAskChatError } from "@/features/ask/error";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import BlockButton from "@/components/BlockButton";
import { useAskChatTurnChargeFlow } from "@/features/ask/useAskChatTurnChargeFlow";
import { getAskChatAnswerFailureMessage } from "@/features/ask/session";
import useToastStore from "@/store/toastStore";
import useModalStore from "@/store/modalStore";
import { useEffect, useRef, useState } from "react";
import { AskChatContainer } from "@/features/ask/AskChatContainer";
import { AskAnswerLoadingMessage } from "@/features/ask/AskAnswerLoadingMessage";
import { homeOptions } from "@/features/home/queries";

export const Route = createFileRoute("/_authenticated/ask/")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(askChatHomeOptions),
      queryClient.ensureQueryData(homeOptions),
    ]),
  errorComponent: AskHomeError,
});

// 물어보기 홈 API를 화면과 첫 세션 생성 흐름에 연결합니다.
function RouteComponent() {
  const [{ data }, { data: homeData }] = useSuspenseQueries({
    queries: [askChatHomeOptions, homeOptions],
  });
  const navigate = useNavigate();
  const { requestCharge, isCharging } = useAskChatTurnChargeFlow();
  const { showToast } = useToastStore();
  const { showError } = useModalStore();
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const startSessionMutation = useStartAskChatSessionMutation({
    onSuccess: (result) => {
      if (!isMountedRef.current) return;
      const sessionId = result.session?.sessionId;
      if (!sessionId) {
        setPendingQuestion(null);
        showError("대화를 시작하지 못했어요.", "잠시 후 다시 시도해주세요.");
        return;
      }
      const failureMessage = getAskChatAnswerFailureMessage(
        result.answerGeneration,
      );
      void navigate({ to: "/ask/chat", search: { sessionId } }).then(() => {
        if (!failureMessage) return;
        showToast({
          message: failureMessage,
          bottom: "bottom-[var(--ask-toast-bottom)]",
          variant: "error",
        });
      });
    },
  });

  return (
    <AskPageLayout
      remainingMessageCount={data.remainingMessageCount}
      onSubmit={async (content) => {
        if ((data.remainingMessageCount ?? 0) <= 0) {
          requestCharge();
          return false;
        }
        setPendingQuestion(content);
        try {
          const result = await startSessionMutation.mutateAsync({ content });
          const hasSessionId = !!result.session?.sessionId;
          if (!hasSessionId) setPendingQuestion(null);
          return hasSessionId;
        } catch {
          setPendingQuestion(null);
          return false;
        }
      }}
      isSubmitDisabled={startSessionMutation.isPending || isCharging}
      isInputVisible={!pendingQuestion}
    >
      {(input) =>
        pendingQuestion ? (
          <AskPendingConversation question={pendingQuestion} />
        ) : (
          <AskMainContent
            data={data}
            recordCount={homeData.totalRecordDays ?? 0}
            input={input}
          />
        )
      }
    </AskPageLayout>
  );
}

// 첫 세션 응답을 기다리는 동안 제출한 질문과 답변 로딩 상태를 보여줍니다.
function AskPendingConversation({ question }: { question: string }) {
  return (
    <div className="flex flex-1 flex-col gap-gap-y-m py-padding-y-xl">
      <AskChatContainer direction="send">{question}</AskChatContainer>
      <AskAnswerLoadingMessage />
    </div>
  );
}

type AskMainContentProps = {
  data: AskChatHome;
  recordCount: number;
  input: AskInputController;
};

// 서버에서 받은 사용자 안내와 예시 질문을 세로로 보여줍니다.
function AskMainContent({ data, recordCount, input }: AskMainContentProps) {
  const sampleQuestions = (data.sampleQuestions ?? []).filter(
    (item) => !!item.question,
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-gap-y-xl py-padding-y-xl text-center">
      <section className="flex flex-col items-center gap-gap-y-m">
        <img
          src="/marble.webp"
          alt="수정구슬"
          className="size-16 rounded-full object-cover"
        />
        <div className="flex flex-col items-center gap-gap-y-xs">
          <p className="text-label-m text-text-secondary">
            {data.nickname} 님,
          </p>
          <p className="text-title-2 text-text-primary">
            오늘은 어떤 모습을 알아볼까요?
          </p>
          <p className="text-caption-s text-text-tertiary">
            지금까지 남긴{" "}
            <span className="font-bold">{recordCount}개의 기록을 바탕으로</span>
            &nbsp;답변을 드려요.
          </p>
        </div>
        <AskCrystalBadge crystals={data.crystalBalance ?? 0} />
      </section>
      <section className="flex w-full flex-col gap-gap-y-l">
        <div className="grid w-full grid-cols-3 gap-gap-x-s">
          {sampleQuestions.map((preset, index) => (
            <button
              key={preset.id ?? `${preset.category}-${index}`}
              type="button"
              onClick={() => input.setValueAndFocus(preset.question!)}
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
    </div>
  );
}

type AskQuestionBadgeProps = {
  category?: string;
};

// 예시 질문의 주제 코드를 기존 카테고리 디자인에 연결합니다.
function AskQuestionBadge({ category }: AskQuestionBadgeProps) {
  const item = category ? findCategoryByCode(category) : undefined;
  if (!item) {
    return (
      <div className="flex items-center justify-center gap-gap-x-xs rounded-lg border border-button-tertiary-border-default bg-surface-base px-padding-x-xxs py-padding-y-xs text-label-s text-button-tertiary-text-default">
        <AppIcon name="bulb" size={16} color="current" />
        <span className="whitespace-nowrap">나답</span>
      </div>
    );
  }
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

// 답변 개수가 부족한 사용자가 직접 주소로 접근했을 때 이용 조건을 안내합니다.
function AskHomeError({ error }: ErrorComponentProps) {
  if (!isAskChatError(error, "ASK_CHAT_NOT_ENOUGH_ANSWERS")) {
    throw error;
  }

  return (
    <>
      <SubHeader>수정구슬에게 물어보기</SubHeader>
      <Container className="items-center justify-center bg-surface-base text-center text-text-primary">
        <div className="flex flex-col items-center gap-gap-y-xl">
          <img
            src="/marble.webp"
            alt="수정구슬"
            className="size-16 rounded-full object-cover opacity-60"
          />
          <div className="flex flex-col gap-gap-y-s">
            <p className="text-title-2">아직 물어보기를 사용할 수 없어요.</p>
            <p className="whitespace-pre-line text-body-2 text-text-tertiary">
              기록에 답변을 20개 이상 남기면{"\n"}수정구슬에게 물어볼 수 있어요.
            </p>
          </div>
          <Link to="/">
            <BlockButton>오늘의 기록으로 돌아가기</BlockButton>
          </Link>
        </div>
      </Container>
    </>
  );
}
