import { createFileRoute } from "@tanstack/react-router";
import {
  AskPageLayout,
  type AskInputController,
} from "@/features/ask/AskPageLayout";
import { AskChatContainer } from "@/features/ask/AskChatContainer";
import { AppIcon } from "@/components/AppIcon";
import { WarningFilledIcon } from "@/components/Icons";
import useModalStore from "@/store/modalStore";
import useToastStore from "@/store/toastStore";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/_authenticated/ask/chat")({
  component: RouteComponent,
});

type AskChatMessage = {
  id: string;
  direction: "receive" | "send";
  content: string;
  followUpQuestions?: string[];
  isBlurred?: boolean;
};

const INITIAL_MESSAGES: AskChatMessage[] = [
  {
    id: "initial-receive",
    direction: "receive",
    content:
      "어떤 모습이 궁금한지 편하게 물어봐요. 기록을 바탕으로 천천히 답변해드릴게요.",
    followUpQuestions: [
      "내 장점은 뭐야?",
      "내 정체성이 두드러질 땐 언젤까?",
    ],
  },
  {
    id: "initial-send",
    direction: "send",
    content: "나는 어떤 사람이야?",
  },
  {
    id: "initial-answer",
    direction: "receive",
    content:
      "아직 API 연결 전이라 실제 답변은 준비 중이에요. 이 화면은 대화 흐름과 레이아웃을 확인하기 위한 임시 상태입니다.",
  },
];

const DUMMY_ANSWER =
  "지금 기록만 놓고 보면, 질문을 던지는 방식이 꽤 섬세해 보여요. 단정하기보다 여러 가능성을 열어두고 스스로를 이해하려는 쪽에 가까워요.";

// 물어보기 대화 화면의 정적 채팅 스캐폴딩을 렌더링합니다.
function RouteComponent() {
  const [messages, setMessages] = useState<AskChatMessage[]>(INITIAL_MESSAGES);
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showCrystalAvatar, setShowCrystalAvatar] = useState(true);
  const answerTimerRef = useRef<number | null>(null);
  const { showToast } = useToastStore();
  const { showModal, closeModal } = useModalStore();

  useEffect(() => {
    return () => {
      if (answerTimerRef.current) {
        window.clearTimeout(answerTimerRef.current);
      }
    };
  }, []);

  const showAnswerErrorToast = () => {
    showToast({
      message: "답변 생성에 오류가 발생했어요.\n다시 시도해주세요.",
      bottom: "bottom-[var(--ask-toast-bottom)]",
      variant: "error",
    });
  };

  const handleSubmit = (message: string) => {
    if (isAnswerLoading) return;

    const submittedAt = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: `send-${submittedAt}`,
        direction: "send",
        content: message,
      },
    ]);
    setIsAnswerLoading(true);

    answerTimerRef.current = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `receive-${submittedAt}`,
          direction: "receive",
          content: DUMMY_ANSWER,
          followUpQuestions: [
            "조금 더 자세히 말해줘",
            "내가 놓치고 있는 건 뭐야?",
          ],
        },
      ]);
      setIsAnswerLoading(false);
      answerTimerRef.current = null;
    }, 800);
  };

  const handleNewChat = () => {
    if (answerTimerRef.current) {
      window.clearTimeout(answerTimerRef.current);
      answerTimerRef.current = null;
    }
    setMessages([]);
    setIsAnswerLoading(false);
  };

  return (
    <AskPageLayout
      onSubmit={handleSubmit}
      isSubmitDisabled={isAnswerLoading}
      onNewChat={handleNewChat}
    >
      {(input) => (
        <>
          <div className="flex flex-1 flex-col gap-gap-y-m py-padding-y-xl">
            {messages.map((message) => (
              <AskChatMessageItem
                key={message.id}
                message={message}
                showAvatar={showCrystalAvatar}
                onSelectFollowUpQuestion={input.setValueAndFocus}
                onClickBlurOverlay={showAnswerErrorToast}
              />
            ))}
            {isAnswerLoading && (
              <AskAnswerLoadingMessage showAvatar={showCrystalAvatar} />
            )}
          </div>
          <AskChatTestFab
            input={input}
            isOpen={isFabOpen}
            isAnswerLoading={isAnswerLoading}
            onToggleOpen={() => setIsFabOpen((prev) => !prev)}
            onShowErrorToast={showAnswerErrorToast}
            onShowModal={() =>
              showModal({
                icon: WarningFilledIcon,
                title: "물어보기 테스트 모달",
                children: "프랍, 모달, 토스트 확인을 위한 임시 모달이에요.",
                buttons: [{ label: "확인", onClick: closeModal }],
              })
            }
            onAddBlurredAnswer={() =>
              setMessages((prev) => [
                ...prev,
                {
                  id: `blurred-${Date.now()}`,
                  direction: "receive",
                  content:
                    "대화 횟수 제한에 걸린 경우를 확인하기 위한 블러 처리 응답입니다.",
                  isBlurred: true,
                },
              ])
            }
            onAddFollowUpAnswer={() =>
              setMessages((prev) => [
                ...prev,
                {
                  id: `follow-up-${Date.now()}`,
                  direction: "receive",
                  content:
                    "꼬리 질문이 포함된 응답 상태를 확인하는 더미 메시지예요.",
                  followUpQuestions: [
                    "이 답변을 더 쉽게 풀어줘",
                    "내 기록에서는 어떤 근거가 있어?",
                  ],
                },
              ])
            }
            onToggleLoading={() => setIsAnswerLoading((prev) => !prev)}
            showCrystalAvatar={showCrystalAvatar}
            onToggleCrystalAvatar={() =>
              setShowCrystalAvatar((prev) => !prev)
            }
          />
        </>
      )}
    </AskPageLayout>
  );
}

type AskChatMessageItemProps = {
  message: AskChatMessage;
  showAvatar: boolean;
  onSelectFollowUpQuestion: (question: string) => void;
  onClickBlurOverlay: () => void;
};

// 물어보기 채팅 메시지를 송수신 방향에 맞춰 렌더링합니다.
function AskChatMessageItem({
  message,
  showAvatar,
  onSelectFollowUpQuestion,
  onClickBlurOverlay,
}: AskChatMessageItemProps) {
  if (message.direction === "send") {
    return (
      <AskChatContainer direction="send">{message.content}</AskChatContainer>
    );
  }

  return (
    <div className="flex items-start gap-gap-x-s">
      {showAvatar && (
        <img
          src="/marble.webp"
          alt="수정구슬"
          className="size-9 rounded-full object-cover"
        />
      )}
      <AskChatContainer
        followUpQuestions={message.followUpQuestions}
        onSelectFollowUpQuestion={onSelectFollowUpQuestion}
        isBlurred={message.isBlurred}
        onClickBlurOverlay={onClickBlurOverlay}
      >
        {message.content}
      </AskChatContainer>
    </div>
  );
}

// 답변 생성 중임을 나타내는 수신 로딩 메시지를 보여줍니다.
function AskAnswerLoadingMessage({ showAvatar }: { showAvatar: boolean }) {
  return (
    <div className="flex items-start gap-gap-x-s">
      {showAvatar && (
        <img
          src="/marble.webp"
          alt=""
          className="size-9 rounded-full object-cover"
        />
      )}
      <AskChatContainer>
        <span className="flex items-center gap-gap-x-xs py-1">
          <span className="size-1.5 animate-pulse rounded-full bg-icon-muted" />
          <span className="size-1.5 animate-pulse rounded-full bg-icon-muted [animation-delay:120ms]" />
          <span className="size-1.5 animate-pulse rounded-full bg-icon-muted [animation-delay:240ms]" />
        </span>
      </AskChatContainer>
    </div>
  );
}

type AskChatTestFabProps = {
  input: AskInputController;
  isOpen: boolean;
  isAnswerLoading: boolean;
  onToggleOpen: () => void;
  onShowErrorToast: () => void;
  onShowModal: () => void;
  onAddBlurredAnswer: () => void;
  onAddFollowUpAnswer: () => void;
  onToggleLoading: () => void;
  showCrystalAvatar: boolean;
  onToggleCrystalAvatar: () => void;
};

// API 구현 전 채팅 프랍, 모달, 토스트 상태를 확인하기 위한 테스트 FAB입니다.
function AskChatTestFab({
  input,
  isOpen,
  isAnswerLoading,
  onToggleOpen,
  onShowErrorToast,
  onShowModal,
  onAddBlurredAnswer,
  onAddFollowUpAnswer,
  onToggleLoading,
  showCrystalAvatar,
  onToggleCrystalAvatar,
}: AskChatTestFabProps) {
  return (
    <div
      style={{ bottom: "calc(var(--ask-toast-bottom, 0px) + 56px)" }}
      className="fixed right-padding-x-m z-30 flex flex-col items-end gap-gap-y-s sm:right-[calc((100vw-412px)/2_+_var(--spacing-padding-x-m))]"
    >
      {isOpen && (
        <div className="flex w-56 flex-col gap-gap-y-xs rounded-2xl border border-border-base bg-surface-base px-padding-x-s py-padding-y-s text-text-primary shadow-3 dark:bg-surface-layer-2">
          <button
            type="button"
            onClick={onShowErrorToast}
            className="rounded-lg px-padding-x-s py-padding-y-xs text-left text-caption-m"
          >
            오류 토스트 표시
          </button>
          <button
            type="button"
            onClick={onShowModal}
            className="rounded-lg px-padding-x-s py-padding-y-xs text-left text-caption-m"
          >
            전역 모달 표시
          </button>
          <button
            type="button"
            onClick={onAddBlurredAnswer}
            className="rounded-lg px-padding-x-s py-padding-y-xs text-left text-caption-m"
          >
            블러 응답 추가
          </button>
          <button
            type="button"
            onClick={onAddFollowUpAnswer}
            className="rounded-lg px-padding-x-s py-padding-y-xs text-left text-caption-m"
          >
            꼬리 질문 응답 추가
          </button>
          <button
            type="button"
            onClick={onToggleLoading}
            className="rounded-lg px-padding-x-s py-padding-y-xs text-left text-caption-m"
          >
            {isAnswerLoading ? "로딩 끄기" : "로딩 켜기"}
          </button>
          <button
            type="button"
            onClick={() => input.setAccessoryVisible(!input.isAccessoryVisible)}
            className="rounded-lg px-padding-x-s py-padding-y-xs text-left text-caption-m"
          >
            {input.isAccessoryVisible ? "입력창 숨기기" : "입력창 보이기"}
          </button>
          <button
            type="button"
            onClick={onToggleCrystalAvatar}
            className="rounded-lg px-padding-x-s py-padding-y-xs text-left text-caption-m"
          >
            {showCrystalAvatar
              ? "수정구슬 아바타 숨기기"
              : "수정구슬 아바타 보이기"}
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex size-12 items-center justify-center rounded-full bg-button-primary-bg-default text-button-primary-text-default shadow-3"
        aria-label="물어보기 테스트 도구"
      >
        <AppIcon
          name={isOpen ? "close-big" : "menu"}
          size={24}
          color="current"
        />
      </button>
    </div>
  );
}
