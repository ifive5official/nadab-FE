import { AppIcon } from "@/components/AppIcon";
import {
  ChatVerificationReceptionIcon,
  CharVerificationSendingIcon,
} from "@/components/Icons";
import clsx from "clsx";
import type { ReactNode } from "react";

type AskChatContainerProps = {
  direction?: "receive" | "send";
  children: ReactNode;
  className?: string;
  followUpQuestions?: string[];
  onSelectFollowUpQuestion?: (question: string) => void;
  isBlurred?: boolean;
  blurOverlayLabel?: string;
  onClickBlurOverlay?: () => void;
};

// 물어보기 대화에서 송수신 꼬리가 붙은 안정적인 말풍선 컨테이너를 보여줍니다.
export function AskChatContainer({
  direction = "receive",
  children,
  className,
  followUpQuestions,
  onSelectFollowUpQuestion,
  isBlurred = false,
  blurOverlayLabel = "보기",
  onClickBlurOverlay,
}: AskChatContainerProps) {
  const isSend = direction === "send";
  const shouldShowReceiveExtras = !isSend;
  const shouldShowBlurOverlay = shouldShowReceiveExtras && isBlurred;
  const shouldShowFollowUpQuestions =
    shouldShowReceiveExtras && !!followUpQuestions?.length;

  return (
    <div
      className={clsx(
        "flex w-fit max-w-[min(78%,272px)] flex-col gap-gap-y-s",
        isSend && "ml-auto",
      )}
    >
      <div
        className={clsx(
          "relative rounded-2xl px-padding-x-m py-padding-y-s text-caption-m shadow-1",
          "break-keep text-left leading-normal",
          isSend
            ? "bg-button-primary-bg-default text-button-primary-text-default"
            : "bg-surface-base text-text-primary",
          className,
        )}
      >
        {isSend ? (
          <CharVerificationSendingIcon className="absolute top-0 -right-0.5 text-button-primary-bg-default" />
        ) : (
          <ChatVerificationReceptionIcon className="absolute top-0 -left-0.5 text-surface-base" />
        )}
        <div
          className={clsx(
            "min-w-0 whitespace-pre-wrap break-words",
            shouldShowBlurOverlay && "blur-sm",
          )}
        >
          {children}
        </div>
        {shouldShowBlurOverlay && (
          <button
            type="button"
            onClick={onClickBlurOverlay}
            className="absolute inset-0 m-auto flex h-fit w-fit items-center justify-center rounded-full bg-surface-alpha px-padding-x-m py-padding-y-xs text-button-3 text-text-primary shadow-1 backdrop-blur-sm"
          >
            {blurOverlayLabel}
          </button>
        )}
      </div>
      {shouldShowFollowUpQuestions && (
        <div className="flex flex-col gap-gap-y-xs">
          {followUpQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => onSelectFollowUpQuestion?.(question)}
              className="flex w-fit max-w-full items-center gap-gap-x-s rounded-2xl bg-overlay-base px-padding-x-m py-padding-y-xs text-left text-caption-l text-text-inverse-primary"
            >
              <AppIcon name="sub-right-filled" size={24} color="current" />
              <span className="min-w-0 whitespace-normal break-words">
                {question}
              </span>
              <AppIcon name="chevron-right" size={18} color="current" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
