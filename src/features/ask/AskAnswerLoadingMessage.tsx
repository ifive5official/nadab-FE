import { AskChatContainer } from "./AskChatContainer";

// 수정구슬의 답변을 기다리는 동안 대화 목록에 로딩 말풍선을 표시합니다.
export function AskAnswerLoadingMessage() {
  return (
    <div className="flex items-start gap-gap-x-s">
      <img
        src="/marble.webp"
        alt=""
        className="size-9 rounded-full object-cover"
      />
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
