import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError } from "axios";
import { createAdRewardFlow } from "./flow";
import type { AdRewardStatus } from "./types";
import { PDF_AD_REWARD_FEATURES } from "./types";

const quote = { feature: "PDF_REPORT_ONLY" as const, crystalCost: 50, balance: 10, requiredCrystal: 40 };
const session = { sessionKey: "session-one", rewardAmount: 40, expiresAt: "2099-01-01T00:00:00Z" };

// 비동기 상태 전이를 실제 네트워크나 광고 없이 검증할 의존성을 만듭니다.
function setup() {
  const deps = {
    quote: vi.fn().mockResolvedValue(quote), create: vi.fn().mockResolvedValue(session),
    status: vi.fn().mockResolvedValue({ status: "PENDING", rewardAmount: 40 }),
    initialize: vi.fn().mockResolvedValue(undefined), show: vi.fn().mockResolvedValue(undefined),
  };
  const request = { owner: Symbol(), feature: quote.feature, resume: vi.fn().mockResolvedValue(undefined), refresh: vi.fn().mockResolvedValue(undefined) };
  return { deps, request, flow: createAdRewardFlow(deps) };
}

// 요청 성공·실패를 테스트가 원하는 순서로 완료할 수 있게 합니다.
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

// Axios와 동일한 구조의 서버 오류를 만들어 오류 분기를 검증합니다.
function apiError(status: number, code?: string) {
  return new AxiosError("실패", undefined, undefined, undefined, { status, data: { code }, statusText: "", headers: {}, config: {} as never });
}

describe("광고 보상 흐름", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

  it("PDF 구성별 광고 대상을 정확히 연결한다", () => {
    expect(PDF_AD_REWARD_FEATURES).toEqual({ REPORT_ONLY: "PDF_REPORT_ONLY", ANSWER_ONLY: "PDF_ANSWER_ONLY", REPORT_AND_ANSWER: "PDF_REPORT_AND_ANSWER" });
  });

  it("광고 버튼을 누르기 전에는 세션을 만들지 않는다", async () => {
    const { flow, deps, request } = setup();
    flow.start(request);
    await vi.advanceTimersByTimeAsync(0);
    expect(flow.getSnapshot().phase).toBe("offer");
    expect(deps.create).not.toHaveBeenCalled();
  });

  it("서버가 REWARDED를 반환한 뒤 캐시 갱신과 원래 요청을 한 번 실행한다", async () => {
    const { flow, deps, request } = setup();
    deps.status.mockResolvedValueOnce({ status: "PENDING", rewardAmount: 40 }).mockResolvedValue({ status: "REWARDED", rewardAmount: 40 });
    flow.start(request);
    await vi.advanceTimersByTimeAsync(0);
    await flow.watch();
    expect(request.resume).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(2000);
    flow.check();
    await vi.advanceTimersByTimeAsync(4000);
    expect(request.refresh).toHaveBeenCalledTimes(1);
    expect(request.resume).toHaveBeenCalledTimes(1);
    expect(request.refresh.mock.invocationCallOrder[0]).toBeLessThan(request.resume.mock.invocationCallOrder[0]);
    expect(flow.getSnapshot().phase).toBe("idle");
  });

  it("광고가 닫힐 때까지 상태 조회와 기능 실행을 기다린다", async () => {
    const { flow, deps, request } = setup();
    const closed = deferred<void>();
    deps.show.mockReturnValue(closed.promise);
    deps.status.mockResolvedValue({ status: "REWARDED", rewardAmount: 40 });
    flow.start(request);
    await vi.advanceTimersByTimeAsync(0);
    const watching = flow.watch();
    await vi.advanceTimersByTimeAsync(0);
    expect(deps.status).not.toHaveBeenCalled();
    expect(request.resume).not.toHaveBeenCalled();
    closed.resolve();
    await watching;
    await vi.advanceTimersByTimeAsync(0);
    expect(request.resume).toHaveBeenCalledOnce();
  });

  it("부족분이 0이면 광고 없이 실행한다", async () => {
    const { flow, deps, request } = setup();
    deps.quote.mockResolvedValue({ ...quote, requiredCrystal: 0, balance: 50 });
    flow.start(request);
    await vi.advanceTimersByTimeAsync(0);
    expect(request.resume).toHaveBeenCalledOnce();
    expect(deps.create).not.toHaveBeenCalled();
  });

  it("세션 발급 시 이미 충분해진 잔액을 광고 없이 처리한다", async () => {
    const { flow, deps, request } = setup();
    deps.create.mockRejectedValue(apiError(400, "AD_REWARD_NOT_NEEDED"));
    flow.start(request);
    await vi.advanceTimersByTimeAsync(0);
    await flow.watch();
    expect(request.resume).toHaveBeenCalledOnce();
    expect(deps.show).not.toHaveBeenCalled();
  });

  it("중복 진입과 광고 버튼 연타에도 세션은 하나만 발급한다", async () => {
    const { flow, deps, request } = setup();
    expect(flow.start(request)).toBe(true);
    expect(flow.start({ ...request, owner: Symbol() })).toBe(false);
    await vi.advanceTimersByTimeAsync(0);
    await Promise.all([flow.watch(), flow.watch()]);
    expect(deps.create).toHaveBeenCalledOnce();
    expect(deps.show).toHaveBeenCalledOnce();
  });

  it("30초 지연 후 다시 확인해도 같은 세션을 조회한다", async () => {
    const { flow, deps, request } = setup();
    flow.start(request);
    await vi.advanceTimersByTimeAsync(0);
    await flow.watch();
    await vi.advanceTimersByTimeAsync(30000);
    expect(flow.getSnapshot().phase).toBe("delayed");
    await flow.watch();
    expect(deps.create).toHaveBeenCalledOnce();
    deps.status.mockResolvedValue({ status: "REWARDED", rewardAmount: 40 });
    flow.check();
    await vi.advanceTimersByTimeAsync(0);
    expect(deps.status.mock.calls.every(([key]) => key === session.sessionKey)).toBe(true);
    expect(request.resume).toHaveBeenCalledOnce();
  });

  it("만료는 자동 재시청하지 않고 명시적인 재시도에서만 새 세션을 만든다", async () => {
    const { flow, deps, request } = setup();
    deps.status.mockResolvedValue({ status: "EXPIRED", rewardAmount: 40 });
    flow.start(request);
    await vi.advanceTimersByTimeAsync(0);
    await flow.watch();
    expect(flow.getSnapshot().phase).toBe("expired");
    expect(request.resume).not.toHaveBeenCalled();
    await flow.watch();
    expect(deps.create).toHaveBeenCalledTimes(2);
  });

  it.each([401, 403, 404])("상태 조회 %i 오류는 폴링을 종료한다", async (status) => {
    const { flow, deps, request } = setup();
    deps.status.mockRejectedValue(apiError(status));
    flow.start(request);
    await vi.advanceTimersByTimeAsync(0);
    await flow.watch();
    await vi.advanceTimersByTimeAsync(30000);
    expect(flow.getSnapshot().phase).toBe("error");
    expect(deps.status).toHaveBeenCalledOnce();
  });

  it("일시적인 통신 오류는 확인 시간 내에서 재시도한다", async () => {
    const { flow, deps, request } = setup();
    deps.status.mockRejectedValueOnce(apiError(503)).mockResolvedValue({ status: "REWARDED", rewardAmount: 40 });
    flow.start(request);
    await vi.advanceTimersByTimeAsync(0);
    await flow.watch();
    await vi.advanceTimersByTimeAsync(2000);
    expect(request.resume).toHaveBeenCalledOnce();
  });

  it("백그라운드에서는 멈추고 복귀 시 같은 세션을 확인한다", async () => {
    const { flow, deps, request } = setup();
    flow.start(request);
    await vi.advanceTimersByTimeAsync(0);
    await flow.watch();
    flow.setActive(false);
    const count = deps.status.mock.calls.length;
    await vi.advanceTimersByTimeAsync(60000);
    expect(deps.status).toHaveBeenCalledTimes(count);
    flow.setActive(true);
    await vi.advanceTimersByTimeAsync(0);
    expect(deps.status).toHaveBeenCalledTimes(count + 1);
    expect(deps.create).toHaveBeenCalledOnce();
  });

  it("화면 이탈 후 늦게 도착한 지급 응답으로 실행하지 않는다", async () => {
    const { flow, deps, request } = setup();
    const status = deferred<AdRewardStatus>();
    deps.status.mockReturnValue(status.promise);
    flow.start(request);
    await vi.advanceTimersByTimeAsync(0);
    await flow.watch();
    flow.cancel(request.owner);
    status.resolve({ status: "REWARDED", rewardAmount: 40 });
    await vi.advanceTimersByTimeAsync(0);
    expect(request.resume).not.toHaveBeenCalled();
    expect(flow.getSnapshot().phase).toBe("idle");
  });

  it("광고 초기화 중 취소하면 세션을 발급하지 않는다", async () => {
    const { flow, deps, request } = setup();
    const ready = deferred<void>();
    deps.initialize.mockReturnValue(ready.promise);
    flow.start(request);
    await vi.advanceTimersByTimeAsync(0);
    const watching = flow.watch();
    flow.cancel();
    ready.resolve();
    await watching;
    expect(deps.create).not.toHaveBeenCalled();
  });

  it("광고 표시 실패 후 자동으로 재시청하지 않는다", async () => {
    const { flow, deps, request } = setup();
    deps.show.mockRejectedValue(new Error("no fill"));
    flow.start(request);
    await vi.advanceTimersByTimeAsync(0);
    await flow.watch();
    expect(flow.getSnapshot().phase).toBe("adError");
    expect(deps.status).not.toHaveBeenCalled();
    expect(request.resume).not.toHaveBeenCalled();
  });

  it("보상 후 원래 요청이 실패해도 재실행이나 광고를 반복하지 않는다", async () => {
    const { flow, deps, request } = setup();
    deps.status.mockResolvedValue({ status: "REWARDED", rewardAmount: 40 });
    request.resume.mockRejectedValue(apiError(400, "WALLET_INSUFFICIENT_BALANCE"));
    flow.start(request);
    await vi.advanceTimersByTimeAsync(0);
    await flow.watch();
    await vi.advanceTimersByTimeAsync(30000);
    expect(request.resume).toHaveBeenCalledOnce();
    expect(deps.create).toHaveBeenCalledOnce();
    expect(flow.getSnapshot().phase).toBe("idle");
  });
});
