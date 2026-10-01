import axios from "axios";
import type { AdRewardFeature, AdRewardQuote, AdRewardSession, AdRewardState, AdRewardStatus } from "./types";

type Dependencies = {
  quote: (feature: AdRewardFeature, signal: AbortSignal) => Promise<AdRewardQuote>;
  create: (feature: AdRewardFeature, signal: AbortSignal) => Promise<AdRewardSession>;
  status: (key: string, signal: AbortSignal) => Promise<AdRewardStatus>;
  initialize: () => Promise<void>;
  show: (session: AdRewardSession, signal: AbortSignal) => Promise<void>;
};
type Request = {
  owner: symbol;
  feature: AdRewardFeature;
  resume: () => Promise<unknown>;
  refresh: () => Promise<unknown>;
};

// 화면과 SDK에서 발생하는 이벤트를 하나의 보상 흐름으로 직렬화합니다.
export function createAdRewardFlow(deps: Dependencies) {
  let state: AdRewardState = { phase: "idle" };
  let request: Request | undefined;
  let run = new AbortController();
  let poll: AbortController | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let active = true;
  const listeners = new Set<() => void>();

  // 변경된 상태를 구독 중인 화면에 전달합니다.
  function update(next: Partial<AdRewardState>) {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  }

  // 이전 폴링과 대기 타이머를 함께 종료합니다.
  function stopPolling() {
    clearTimeout(timer);
    clearTimeout(deadline);
    poll?.abort();
    poll = undefined;
  }

  // 화면 이탈이나 로그아웃 후 늦은 응답이 기능을 실행하지 못하게 합니다.
  function cancel(owner?: symbol) {
    if (owner && request?.owner !== owner) return;
    stopPolling();
    run.abort();
    request = undefined;
    state = { phase: "idle" };
    listeners.forEach((listener) => listener());
  }

  // 서버 지급 또는 광고 불필요 확인 후 원래 요청을 한 번만 실행합니다.
  async function resume(signal: AbortSignal) {
    if (signal.aborted || !request || state.phase === "resuming") return;
    stopPolling();
    const current = request;
    update({ phase: "resuming" });
    try {
      await current.refresh();
      if (!signal.aborted) await current.resume();
    } catch {
      // 원래 기능의 mutation이 도메인 오류 안내를 담당합니다.
    } finally {
      if (!signal.aborted) cancel();
    }
  }

  // 인증·권한 오류는 중단하고 일시적인 통신 오류만 다시 조회합니다.
  function isTerminal(error: unknown) {
    return !axios.isAxiosError(error) || [401, 403, 404].includes(error.response?.status ?? 0);
  }

  // 광고가 닫힌 뒤 서버 상태를 최대 30초 동안 2초 간격으로 확인합니다.
  function check() {
    if (!["showing", "checking", "delayed"].includes(state.phase) || !state.session || !request || run.signal.aborted) return;
    stopPolling();
    update({ phase: "checking", message: undefined });
    if (!active) return;
    const currentRun = run.signal;
    const sessionKey = state.session.sessionKey;
    const currentPoll = new AbortController();
    poll = currentPoll;
    deadline = setTimeout(() => {
      stopPolling();
      update({ phase: "delayed" });
    }, 30000);

    // 이전 세션 응답은 무시하고 현재 세션의 지급 결과만 반영합니다.
    async function tick() {
      try {
        const result = await deps.status(sessionKey, currentPoll.signal);
        if (currentRun.aborted || currentPoll.signal.aborted) return;
        if (result.status === "REWARDED") {
          await resume(currentRun);
          return;
        }
        if (result.status === "EXPIRED") {
          stopPolling();
          update({ phase: "expired" });
          return;
        }
      } catch (error) {
        if (currentRun.aborted || currentPoll.signal.aborted) return;
        if (isTerminal(error)) {
          stopPolling();
          update({ phase: "error", message: "광고 보상 상태를 확인할 수 없어요. 다시 로그인하거나 잠시 후 시도해 주세요." });
          return;
        }
      }
      if (!currentRun.aborted && !currentPoll.signal.aborted) timer = setTimeout(() => void tick(), 2000);
    }
    void tick();
  }

  // 동의·초기화가 끝난 후 세션을 발급하고 해당 세션으로 광고를 표시합니다.
  async function watch() {
    if (!["offer", "expired", "adError"].includes(state.phase) || !request) return;
    const signal = run.signal;
    const feature = request.feature;
    update({ phase: "preparing", message: undefined });
    try {
      await deps.initialize();
      if (signal.aborted) return;
      const session = await deps.create(feature, signal);
      if (signal.aborted) return;
      update({ phase: "showing", session });
      await deps.show(session, signal);
      if (!signal.aborted) check();
    } catch (error) {
      if (signal.aborted) return;
      if (axios.isAxiosError(error) && error.response?.data?.code === "AD_REWARD_NOT_NEEDED") {
        await resume(signal);
        return;
      }
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      update({
        phase: status && [401, 403, 404].includes(status) ? "error" : "adError",
        message: "광고를 준비하지 못했어요. 잠시 후 다시 시도해 주세요.",
      });
    }
  }

  // 사용자가 시도한 기능을 보존하고 부족분 안내를 준비합니다.
  function start(next: Request) {
    if (state.phase !== "idle") return false;
    run = new AbortController();
    const signal = run.signal;
    request = next;
    update({ phase: "quoting", feature: next.feature });
    void deps.quote(next.feature, signal).then(async (quote) => {
      if (signal.aborted) return;
      update({ quote });
      if (quote.requiredCrystal === 0) await resume(signal);
      else update({ phase: "offer" });
    }).catch(() => {
      if (!signal.aborted) update({ phase: "error", message: "크리스탈 부족분을 확인하지 못했어요. 잠시 후 다시 시도해 주세요." });
    });
    return true;
  }

  // 앱이 활성 상태일 때만 지급 확인을 계속합니다.
  function setActive(value: boolean) {
    active = value;
    if (state.phase !== "checking") return;
    if (active) check();
    else stopPolling();
  }

  return {
    start, watch, check, cancel, setActive,
    // 외부 저장소 구독을 해제할 수 있는 정리 함수를 반환합니다.
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    // React가 동일한 상태 객체를 읽도록 현재 스냅샷을 반환합니다.
    getSnapshot: () => state,
  };
}
