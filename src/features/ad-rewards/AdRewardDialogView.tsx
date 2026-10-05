import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import BlockButton from "@/components/BlockButton";
import { LoadingIcon } from "@/components/Icons";
import type { AdRewardState } from "./types";

export type AdRewardDialogViewProps = {
  state: AdRewardState;
  onCancel: () => void;
  onWatch: () => void;
  onCheck: () => void;
};

const TITLES = {
  idle: "", quoting: "크리스탈을 확인하고 있어요.", offer: "크리스탈이 부족해요.",
  preparing: "광고를 준비하고 있어요.", showing: "광고를 시청해 주세요.",
  checking: "보상 지급을 확인하고 있어요.", delayed: "지급 확인이 지연되고 있어요.",
  expired: "광고 보상 세션이 만료되었어요.", adError: "광고를 불러오지 못했어요.",
  error: "광고 보상을 확인하지 못했어요.", resuming: "요청한 기능을 실행하고 있어요.",
};

// 표시 상태와 동작을 전달받아 앱과 Storybook에서 동일한 광고 안내 화면을 표시합니다.
export function AdRewardDialogView({ state, onCancel, onWatch, onCheck }: AdRewardDialogViewProps) {
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const visible = state.phase !== "idle";
  const busy = ["quoting", "preparing", "showing", "checking", "resuming"].includes(state.phase);
  const canCancel = !["showing", "resuming"].includes(state.phase);
  const continuation = state.feature === "ASK_CHAT_TURN_CHARGE" ? "대화권 충전" : "PDF 생성";
  const latest = useRef({ canCancel, onCancel });

  // 상태 전환 때 초점을 다시 잡지 않으면서 최신 취소 가능 여부를 반영합니다.
  useLayoutEffect(() => { latest.current = { canCancel, onCancel }; }, [canCancel, onCancel]);

  useEffect(() => {
    if (!visible) return;
    const previousFocus = document.activeElement;
    dialog.current?.focus();
    // 광고 모달 안에서 키보드 초점을 유지하고 취소 가능한 단계만 닫습니다.
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (latest.current.canCancel) latest.current.onCancel();
      }
      if (event.key !== "Tab") return;
      const buttons = Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (!first) { event.preventDefault(); dialog.current?.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [visible]);

  if (!visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-padding-x-m">
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="w-full max-w-[412px] rounded-2xl border border-border-base bg-surface-base p-padding-x-xl text-text-primary outline-none dark:bg-surface-layer-2"
    >
      {visible && <div className="flex flex-col gap-gap-y-l text-center">
        <p id={titleId} className="text-label-l" aria-live="polite">{TITLES[state.phase]}</p>
        <div id={descriptionId} className="text-caption-m">
          {state.phase === "offer" && state.quote && <>
            <p>필요한 크리스탈 {state.quote.crystalCost}개 · 보유 {state.quote.balance}개</p>
            <p>광고를 보고 부족한 {state.quote.requiredCrystal}개를 채우면 {continuation}이 바로 진행돼요.</p>
          </>}
          {state.phase === "delayed" && <p>보상이 늦게 지급될 수 있어요. 광고를 다시 보지 않고 지급 상태를 다시 확인할 수 있어요.</p>}
          {state.phase === "expired" && <p>보상이 지급되지 않았어요. 광고를 다시 보고 {continuation}을 진행할 수 있어요.</p>}
          {state.message && <p>{state.message}</p>}
          {busy && <div className="flex justify-center py-padding-y-m"><LoadingIcon /></div>}
        </div>
        <div className="flex gap-gap-x-s">
          {canCancel && <BlockButton variant="secondary" onClick={onCancel}>돌아가기</BlockButton>}
          {["offer", "expired", "adError"].includes(state.phase) && <BlockButton onClick={onWatch}>
            {state.phase === "offer" ? `광고 보고 ${continuation}` : "광고 다시 시도"}
          </BlockButton>}
          {state.phase === "delayed" && <BlockButton onClick={onCheck}>다시 확인</BlockButton>}
        </div>
      </div>}
    </div>
    </div>,
    document.getElementById("modal-root") ?? document.body,
  );
}
