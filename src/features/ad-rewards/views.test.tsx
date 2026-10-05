// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdRewardDialogView } from "./AdRewardDialogView";
import { AdPrivacySettingsView } from "./AdPrivacySettingsView";
import type { AdRewardState } from "./types";

const offer: AdRewardState = {
  phase: "offer",
  feature: "ASK_CHAT_TURN_CHARGE",
  quote: { feature: "ASK_CHAT_TURN_CHARGE", crystalCost: 10, balance: 3, requiredCrystal: 7 },
};

// 화면에서 발생한 사용자 동작을 독립적으로 확인할 콜백을 만듭니다.
function actions() { return { onCancel: vi.fn(), onWatch: vi.fn(), onCheck: vi.fn() }; }

afterEach(cleanup);

describe("광고 보상 안내 화면", () => {
  it("금액과 후속 기능을 표시하고 사용자가 선택한 동작만 호출한다", () => {
    const callbacks = actions();
    const { rerender } = render(<AdRewardDialogView state={offer} {...callbacks} />);
    expect(screen.getByText("필요한 크리스탈 10개 · 보유 3개")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "광고 보고 대화권 충전" }));
    expect(callbacks.onWatch).toHaveBeenCalledOnce();
    expect(callbacks.onCheck).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "돌아가기" }));
    expect(callbacks.onCancel).toHaveBeenCalledOnce();
    rerender(<AdRewardDialogView state={{ ...offer, feature: "PDF_REPORT_ONLY" }} {...callbacks} />);
    expect(screen.getByRole("button", { name: "광고 보고 PDF 생성" })).toBeTruthy();
  });

  it("지급 지연은 같은 세션 확인을, 만료와 광고 실패는 명시적 광고 재시도를 제공한다", () => {
    const callbacks = actions();
    const { rerender } = render(<AdRewardDialogView state={{ phase: "delayed" }} {...callbacks} />);
    fireEvent.click(screen.getByRole("button", { name: "다시 확인" }));
    expect(callbacks.onCheck).toHaveBeenCalledOnce();
    expect(callbacks.onWatch).not.toHaveBeenCalled();
    for (const phase of ["expired", "adError"] as const) {
      rerender(<AdRewardDialogView state={{ phase }} {...callbacks} />);
      expect(screen.queryByRole("button", { name: "다시 확인" })).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "광고 다시 시도" }));
    }
    expect(callbacks.onWatch).toHaveBeenCalledTimes(2);
  });

  it("표시 중 상태와 콜백이 바뀌어도 최신 Escape 제한을 지킨다", () => {
    const callbacks = actions();
    const { rerender } = render(<AdRewardDialogView state={offer} {...callbacks} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(callbacks.onCancel).toHaveBeenCalledOnce();
    for (const phase of ["showing", "resuming"] as const) {
      rerender(<AdRewardDialogView state={{ phase }} {...callbacks} />);
      expect(screen.queryByRole("button")).toBeNull();
      fireEvent.keyDown(document, { key: "Escape" });
    }
    expect(callbacks.onCancel).toHaveBeenCalledOnce();
    const nextCancel = vi.fn();
    rerender(<AdRewardDialogView state={{ phase: "checking" }} {...callbacks} onCancel={nextCancel} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(nextCancel).toHaveBeenCalledOnce();
    expect(callbacks.onCancel).toHaveBeenCalledOnce();
  });

  it("초점을 팝업 내부에 유지하고 닫히면 이전 요소로 복원한다", () => {
    const callbacks = actions();
    const { rerender } = render(<>
      <button>팝업 열기</button>
      <AdRewardDialogView state={{ phase: "idle" }} {...callbacks} />
    </>);
    const opener = screen.getByRole("button", { name: "팝업 열기" });
    opener.focus();
    rerender(<><button>팝업 열기</button><AdRewardDialogView state={offer} {...callbacks} /></>);
    const dialog = screen.getByRole("dialog", { name: "크리스탈이 부족해요." });
    expect(document.activeElement).toBe(dialog);
    const first = screen.getByRole("button", { name: "돌아가기" });
    const last = screen.getByRole("button", { name: "광고 보고 대화권 충전" });
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
    rerender(<><button>팝업 열기</button><AdRewardDialogView state={{ phase: "idle" }} {...callbacks} /></>);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(callbacks.onCancel).not.toHaveBeenCalled();
  });

  it("버튼이 없는 시청 화면에서도 Tab 초점을 유지하고 언마운트 시 리스너를 정리한다", () => {
    const callbacks = actions();
    const { unmount } = render(<AdRewardDialogView state={{ phase: "showing" }} {...callbacks} />);
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByRole("dialog"));
    unmount();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(callbacks.onCancel).not.toHaveBeenCalled();
  });

  it("앱과 같은 modal-root 포털에 표시한다", () => {
    const portal = document.createElement("div");
    portal.id = "modal-root";
    document.body.append(portal);
    try {
      const { unmount } = render(<AdRewardDialogView state={offer} {...actions()} />);
      expect(portal.contains(screen.getByRole("dialog"))).toBe(true);
      unmount();
      expect(portal.childElementCount).toBe(0);
    } finally { portal.remove(); }
  });
});

describe("광고 개인정보 설정 화면", () => {
  it("지원 환경에서만 표시하고 처리 중 중복 클릭을 차단한다", () => {
    const onOpen = vi.fn();
    const { rerender } = render(<AdPrivacySettingsView visible pending={false} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button", { name: "광고 개인정보 설정" }));
    expect(onOpen).toHaveBeenCalledOnce();
    rerender(<AdPrivacySettingsView visible pending onOpen={onOpen} />);
    const button = screen.getByRole("button", { name: "광고 개인정보 설정" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onOpen).toHaveBeenCalledOnce();
    rerender(<AdPrivacySettingsView visible={false} pending={false} onOpen={onOpen} />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByText("광고")).toBeNull();
  });
});
