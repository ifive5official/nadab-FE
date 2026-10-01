// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PropsWithChildren } from "react";
import { api } from "@/lib/axios";
import { useStartPdfExportMutation } from "@/features/pdf/useStartPdfExportMutation";
import { useAskChatTurnChargeFlow } from "@/features/ask/useAskChatTurnChargeFlow";
import useModalStore from "@/store/modalStore";

const reward = vi.hoisted(() => ({ requestReward: vi.fn() }));
vi.mock("./useAdRewardFlow", () => ({ useAdRewardFlow: () => ({ ...reward, isRewardBusy: false }) }));
vi.mock("@/lib/axios", () => ({ api: { get: vi.fn(), post: vi.fn() } }));

// 실제 mutation과 캐시 동작을 검증할 독립적인 QueryClient를 제공합니다.
function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  // 테스트 대상 훅에 React Query 문맥을 제공합니다.
  function Wrapper({ children }: PropsWithChildren) { return <QueryClientProvider client={client}>{children}</QueryClientProvider>; }
  return { client, wrapper: Wrapper };
}

describe("기존 기능과 보상 연결", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: { data: { crystalBalance: 0 } } });
    useModalStore.getState().closeModal();
  });
  afterEach(cleanup);

  it("PDF 부족 오류에 실패한 날짜와 구성을 그대로 전달한다", async () => {
    const { wrapper } = createWrapper();
    const onInsufficientBalance = vi.fn();
    vi.mocked(api.post).mockRejectedValue({ response: { data: { code: "WALLET_INSUFFICIENT_BALANCE" } } });
    const { result } = renderHook(() => useStartPdfExportMutation({ onSuccess: vi.fn(), onAlreadyInProgress: vi.fn(), onInvalidPeriod: vi.fn(), onNoData: vi.fn(), onServerBusy: vi.fn(), onInsufficientBalance }), { wrapper });
    const request = { type: "REPORT_AND_ANSWER" as const, startDate: "2026-01-01", endDate: "2026-09-22" };
    await act(async () => { await result.current.mutateAsync(request).catch(() => undefined); });
    expect(onInsufficientBalance).toHaveBeenCalledWith(request);
    expect(api.post).toHaveBeenCalledTimes(1);
  });

  it("보상 후 대화권만 충전하고 질문 전송 API는 호출하지 않는다", async () => {
    const { client, wrapper } = createWrapper();
    reward.requestReward.mockReturnValue(true);
    vi.mocked(api.post).mockRejectedValueOnce({ response: { data: { code: "WALLET_INSUFFICIENT_BALANCE" } } })
      .mockResolvedValue({ data: { data: { crystalBalance: 0, remainingMessageCount: 10 } } });
    const { result } = renderHook(() => useAskChatTurnChargeFlow(), { wrapper });
    act(() => result.current.requestCharge());
    act(() => useModalStore.getState().config!.buttons[0].onClick());
    await waitFor(() => expect(reward.requestReward).toHaveBeenCalledWith("ASK_CHAT_TURN_CHARGE", expect.any(Function)));
    await act(async () => { await reward.requestReward.mock.calls[0][1](); });
    expect(vi.mocked(api.post).mock.calls.map(([url]) => url)).toEqual(["/api/v1/ask-chat/turns/charge", "/api/v1/ask-chat/turns/charge"]);
    expect(client.getQueryData(["currentUser", "askChat", "remainingTurns"])).toEqual({ remainingMessageCount: 10 });
  });

  it("디버그 미리보기는 광고나 충전 요청을 하지 않는다", () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useAskChatTurnChargeFlow(), { wrapper });
    act(() => result.current.requestCharge({ previewOnly: true }));
    act(() => useModalStore.getState().config!.buttons[0].onClick());
    expect(api.post).not.toHaveBeenCalled();
    expect(reward.requestReward).not.toHaveBeenCalled();
  });

  it("광고 미지원 또는 보상 후 재실패 시 기존 부족 안내로 돌아간다", async () => {
    const { wrapper } = createWrapper();
    reward.requestReward.mockReturnValue(false);
    vi.mocked(api.post).mockRejectedValue({ response: { data: { code: "WALLET_INSUFFICIENT_BALANCE" } } });
    const { result } = renderHook(() => useAskChatTurnChargeFlow(), { wrapper });
    act(() => result.current.requestCharge());
    act(() => useModalStore.getState().config!.buttons[0].onClick());
    await waitFor(() => expect(useModalStore.getState().config?.title).toBe("크리스탈이 부족해요."));
    expect(api.post).toHaveBeenCalledOnce();
  });
});
