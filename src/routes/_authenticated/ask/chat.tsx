import { AppIcon } from "@/components/AppIcon";
import { AskAnswerLoadingMessage } from "@/features/ask/AskAnswerLoadingMessage";
import { AskChatContainer } from "@/features/ask/AskChatContainer";
import { AskPageLayout } from "@/features/ask/AskPageLayout";
import {
  askChatHistoryDetailOptions,
  askChatKeys,
  askChatRemainingTurnsOptions,
} from "@/features/ask/queries";
import {
  getAskChatAnswerFailureMessage,
  isAskChatSessionReadOnly,
} from "@/features/ask/session";
import type { AskChatQuestionSendResult } from "@/features/ask/useStartAskChatSessionMutation";
import { useSendAskChatQuestionMutation } from "@/features/ask/useSendAskChatQuestionMutation";
import { useAskChatTurnChargeFlow } from "@/features/ask/useAskChatTurnChargeFlow";
import useToastStore from "@/store/toastStore";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { isAskChatError } from "@/features/ask/error";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import BlockButton from "@/components/BlockButton";
import { AskChatDebugPanel } from "@/features/ask/AskChatDebugPanel";
import { AskMarkdownContent } from "@/features/ask/AskMarkdownContent";
import useModalStore from "@/store/modalStore";

export const Route = createFileRoute("/_authenticated/ask/chat")({
  component: RouteComponent,
  validateSearch: (
    search: Record<string, unknown>,
  ): { sessionId?: number } => {
    const sessionId = Number(search.sessionId);
    return {
      sessionId:
        Number.isInteger(sessionId) && sessionId > 0 ? sessionId : undefined,
    };
  },
  loaderDeps: ({ search }) => ({ sessionId: search.sessionId }),
  loader: async ({ context: { queryClient }, deps: { sessionId } }) => {
    if (!sessionId) throw redirect({ to: "/ask" });
    await Promise.all([
      queryClient.ensureQueryData(askChatHistoryDetailOptions(sessionId)),
      queryClient.ensureQueryData(askChatRemainingTurnsOptions),
    ]);
  },
  errorComponent: AskChatError,
});

// 세션 상세와 질문 전송 API를 연결해 실제 물어보기 대화를 렌더링합니다.
function RouteComponent() {
  const sessionId = Route.useSearch().sessionId!;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: detail } = useSuspenseQuery(
    askChatHistoryDetailOptions(sessionId),
  );
  const { data: remainingTurns } = useSuspenseQuery(
    askChatRemainingTurnsOptions,
  );
  const { showToast } = useToastStore();
  const { showError } = useModalStore();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const initialResult = queryClient.getQueryData<AskChatQuestionSendResult>(
    askChatKeys.sessionResult(sessionId),
  );
  const [followUpQuestionsByMessageId, setFollowUpQuestionsByMessageId] =
    useState<Record<number, string[]>>(() => {
      const assistantId = initialResult?.assistantMessage?.id;
      return assistantId && initialResult?.followUpQuestions?.length
        ? { [assistantId]: initialResult.followUpQuestions }
        : {};
    });
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugReadOnly, setDebugReadOnly] = useState(false);
  const [debugNoTurns, setDebugNoTurns] = useState(false);
  const [debugFailedQuestion, setDebugFailedQuestion] = useState<string | null>(
    null,
  );
  const { requestCharge, isCharging } = useAskChatTurnChargeFlow();
  const sendQuestionMutation = useSendAskChatQuestionMutation({
    onSuccess: (result) => {
      const failureMessage = getAskChatAnswerFailureMessage(
        result.answerGeneration,
      );
      if (failureMessage) {
        showToast({
          message: failureMessage,
          bottom: "bottom-[var(--ask-toast-bottom)]",
          variant: "error",
        });
        return;
      }

      const assistantId = result.assistantMessage?.id;
      if (assistantId && result.followUpQuestions?.length) {
        setFollowUpQuestionsByMessageId((previous) => ({
          ...previous,
          [assistantId]: result.followUpQuestions!,
        }));
      }
    },
  });
  const messages = (detail.messages ?? []).filter(
    (message) =>
      !!message.content &&
      !(message.role === "ASSISTANT" && message.status === "FAILED"),
  );
  const isReadOnly = isAskChatSessionReadOnly(detail) || debugReadOnly;
  const remainingMessageCount = debugNoTurns
    ? 0
    : remainingTurns.remainingMessageCount;
  const isAnswerLoading = sendQuestionMutation.isPending || debugLoading;

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sendQuestionMutation.isPending]);

  return (
    <>
      <AskPageLayout
        remainingMessageCount={remainingMessageCount}
        onSubmit={async (content) => {
          if ((remainingMessageCount ?? 0) <= 0) {
            requestCharge({ previewOnly: debugNoTurns });
            return false;
          }
          setPendingQuestion(content);
          try {
            await sendQuestionMutation.mutateAsync({ sessionId, content });
            return true;
          } catch {
            return false;
          } finally {
            setPendingQuestion(null);
          }
        }}
        isSubmitDisabled={
          sendQuestionMutation.isPending || isCharging || isReadOnly
        }
        isInputVisible={!isReadOnly}
        onNewChat={() => navigate({ to: "/ask" })}
      >
        {(input) => (
          <div className="flex flex-1 flex-col gap-gap-y-m py-padding-y-xl">
            {messages.map((message, index) => (
              <AskChatMessageItem
                key={message.id ?? `${message.role}-${index}`}
                role={message.role}
                content={message.content!}
                followUpQuestions={
                  message.id
                    ? followUpQuestionsByMessageId[message.id]
                    : undefined
                }
                onSelectFollowUpQuestion={input.setValueAndFocus}
              />
            ))}
            {pendingQuestion && (
              <AskChatContainer direction="send">
                {pendingQuestion}
              </AskChatContainer>
            )}
            {debugFailedQuestion && (
              <AskChatContainer direction="send">
                {debugFailedQuestion}
              </AskChatContainer>
            )}
            {isAnswerLoading && <AskAnswerLoadingMessage />}
            {isReadOnly && <AskReadOnlyNotice />}
            <div ref={messageEndRef} />
          </div>
        )}
      </AskPageLayout>
      {import.meta.env.DEV && (
        <AskChatDebugPanel
          isLoading={debugLoading}
          isReadOnly={debugReadOnly}
          hasNoTurns={debugNoTurns}
          onToggleLoading={() => setDebugLoading((previous) => !previous)}
          onToggleReadOnly={() => setDebugReadOnly((previous) => !previous)}
          onToggleNoTurns={() => setDebugNoTurns((previous) => !previous)}
          onShowAnswerFailure={() => {
            setDebugFailedQuestion("내 메시지가 저장되는 실패 상태를 확인해줘.");
            showToast({
              message: "답변 생성에 오류가 발생했어요.\n다시 시도해주세요.",
              bottom: "bottom-[var(--ask-toast-bottom)]",
              variant: "error",
            });
          }}
          onShowSendFailure={() =>
            showError(
              "메시지를 전송하지 못했어요.",
              "네트워크 확인 후 다시 시도해주세요.",
            )
          }
        />
      )}
    </>
  );
}

type AskChatMessageItemProps = {
  role?: "USER" | "ASSISTANT";
  content: string;
  followUpQuestions?: string[];
  onSelectFollowUpQuestion: (question: string) => void;
};

// API 메시지 역할에 맞춰 사용자와 수정구슬 말풍선을 구분합니다.
function AskChatMessageItem({
  role,
  content,
  followUpQuestions,
  onSelectFollowUpQuestion,
}: AskChatMessageItemProps) {
  if (role === "USER") {
    return <AskChatContainer direction="send">{content}</AskChatContainer>;
  }

  return (
    <div className="flex items-start gap-gap-x-s">
      <img
        src="/marble.webp"
        alt="수정구슬"
        className="size-9 rounded-full object-cover"
      />
      <AskChatContainer
        followUpQuestions={followUpQuestions}
        onSelectFollowUpQuestion={onSelectFollowUpQuestion}
      >
        <AskMarkdownContent content={content} />
      </AskChatContainer>
    </div>
  );
}

// 종료된 세션에서 입력창 대신 새 대화를 시작할 수 있음을 안내합니다.
function AskReadOnlyNotice() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-gap-y-s rounded-2xl bg-surface-base px-padding-x-m py-padding-y-m text-center shadow-1">
      <div className="flex flex-col gap-gap-y-xs">
        <p className="text-label-m text-text-primary">
          한 대화의 메시지 한도에 도달했어요.
        </p>
        <p className="whitespace-pre-line text-caption-m text-text-tertiary">
          한 대화에서 나눌 수 있는 15번의 질문과 답변을 모두 사용했어요.{"\n"}
          새로운 대화를 시작하면 계속 질문할 수 있어요.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate({ to: "/ask" })}
        className="flex items-center gap-gap-x-xxs text-button-3 text-button-tertiary-text-default"
      >
        <span>새로운 대화 시작하기</span>
        <AppIcon name="chevron-right" size={16} color="current" />
      </button>
    </div>
  );
}

// 조회할 수 없는 세션에서 보관함이나 새 대화로 안전하게 이동하도록 안내합니다.
function AskChatError({ error }: ErrorComponentProps) {
  if (!isAskChatError(error, "ASK_CHAT_SESSION_NOT_FOUND")) {
    throw error;
  }

  return (
    <>
      <SubHeader>수정구슬에게 물어보기</SubHeader>
      <Container className="items-center justify-center bg-surface-base text-center text-text-primary">
        <div className="flex flex-col items-center gap-gap-y-xl">
          <div className="flex flex-col gap-gap-y-s">
            <p className="text-title-2">대화를 찾을 수 없어요.</p>
            <p className="text-body-2 text-text-tertiary">
              삭제되었거나 접근할 수 없는 대화예요.
            </p>
          </div>
          <div className="flex w-full gap-gap-x-s">
            <LinkButton to="/ask/archive" label="보관함 보기" />
            <LinkButton to="/ask" label="새 대화 시작" />
          </div>
        </div>
      </Container>
    </>
  );
}

type LinkButtonProps = {
  to: "/ask" | "/ask/archive";
  label: string;
};

// 세션 오류 화면에서 지정한 물어보기 경로로 이동하는 버튼을 제공합니다.
function LinkButton({ to, label }: LinkButtonProps) {
  const navigate = useNavigate();
  return <BlockButton onClick={() => navigate({ to })}>{label}</BlockButton>;
}
