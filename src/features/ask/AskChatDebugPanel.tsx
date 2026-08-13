import { AppIcon } from "@/components/AppIcon";
import { useState } from "react";

type AskChatDebugPanelProps = {
  isLoading: boolean;
  isReadOnly: boolean;
  hasNoTurns: boolean;
  onToggleLoading: () => void;
  onToggleReadOnly: () => void;
  onToggleNoTurns: () => void;
  onShowAnswerFailure: () => void;
  onShowSendFailure: () => void;
};

// 실제 데이터 변경 없이 물어보기 채팅의 예외 상태를 전환하는 디버그 패널입니다.
export function AskChatDebugPanel({
  isLoading,
  isReadOnly,
  hasNoTurns,
  onToggleLoading,
  onToggleReadOnly,
  onToggleNoTurns,
  onShowAnswerFailure,
  onShowSendFailure,
}: AskChatDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-padding-x-m bottom-[calc(var(--ask-toast-bottom,0px)+56px)] z-1 flex flex-col items-end gap-gap-y-s sm:right-[calc((100vw-412px)/2_+_var(--spacing-padding-x-m))]">
      {isOpen && (
        <div className="flex w-60 flex-col gap-gap-y-xs rounded-xl border border-border-base bg-surface-base p-padding-x-s text-text-primary shadow-3 dark:bg-surface-layer-2">
          <p className="px-padding-x-s pt-padding-y-xs text-label-m">
            물어보기 디버그
          </p>
          <DebugButton
            label={isLoading ? "답변 로딩 해제" : "답변 로딩 표시"}
            onClick={onToggleLoading}
          />
          <DebugButton
            label={isReadOnly ? "대화 한계 해제" : "15회 대화 한계 도달"}
            onClick={onToggleReadOnly}
          />
          <DebugButton
            label={hasNoTurns ? "대화권 복구" : "남은 대화권 0회"}
            onClick={onToggleNoTurns}
          />
          <DebugButton
            label="AI 답변 생성 실패"
            onClick={onShowAnswerFailure}
          />
          <DebugButton label="메시지 전송 실패" onClick={onShowSendFailure} />
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label="물어보기 디버그 패널"
        className="flex size-12 items-center justify-center rounded-full bg-button-primary-bg-default text-button-primary-text-default shadow-3"
      >
        <AppIcon name={isOpen ? "close-big" : "tools"} size={24} color="current" />
      </button>
    </div>
  );
}

type DebugButtonProps = {
  label: string;
  onClick: () => void;
};

// 디버그 패널에서 개별 채팅 상태를 실행하는 버튼을 표시합니다.
function DebugButton({ label, onClick }: DebugButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg px-padding-x-s py-padding-y-xs text-left text-caption-m hover:bg-surface-layer-1"
    >
      {label}
    </button>
  );
}
