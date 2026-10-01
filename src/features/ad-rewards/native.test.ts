import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({
  listeners: new Map<string, () => void>(),
  prepare: vi.fn(), show: vi.fn(), remove: vi.fn(), initialize: vi.fn(), consent: vi.fn(), form: vi.fn(),
  platform: "android", native: true,
}));

vi.mock("@capacitor/core", () => ({ Capacitor: { getPlatform: () => sdk.platform, isNativePlatform: () => sdk.native } }));
vi.mock("@capacitor-community/admob", () => ({
  AdmobConsentStatus: { REQUIRED: "REQUIRED" },
  RewardAdPluginEvents: { Dismissed: "dismissed", FailedToShow: "showFailed", FailedToLoad: "loadFailed" },
  AdMob: {
    initialize: sdk.initialize, requestConsentInfo: sdk.consent, showConsentForm: sdk.form,
    prepareRewardVideoAd: sdk.prepare, showRewardVideoAd: sdk.show,
    // SDK 이벤트 구독과 정리 횟수를 검증하기 위한 네이티브 대역입니다.
    addListener: vi.fn(async (event: string, callback: () => void) => {
      sdk.listeners.set(event, callback);
      return { remove: () => { sdk.listeners.delete(event); sdk.remove(event); return Promise.resolve(); } };
    }),
  },
}));

const session = { sessionKey: "server-session", rewardAmount: 70, expiresAt: "2099-01-01T00:00:00Z" };

describe("네이티브 광고 어댑터", () => {
  beforeEach(() => {
    vi.resetModules(); vi.resetAllMocks(); sdk.listeners.clear();
    sdk.platform = "android"; sdk.native = true;
    sdk.prepare.mockResolvedValue(undefined); sdk.show.mockResolvedValue({ amount: 999 });
    sdk.initialize.mockResolvedValue(undefined);
    sdk.consent.mockResolvedValue({ canRequestAds: true });
    vi.stubEnv("VITE_AD_REWARDS_ENABLED", "true");
    vi.stubEnv("VITE_ADMOB_ANDROID_APP_ID", "ca-app-pub-1~2");
    vi.stubEnv("VITE_ADMOB_ANDROID_REWARDED_ID", "ca-app-pub-1/3");
    vi.stubEnv("VITE_ADMOB_IOS_APP_ID", "ca-app-pub-4~5");
    vi.stubEnv("VITE_ADMOB_IOS_REWARDED_ID", "ca-app-pub-4/6");
  });
  afterEach(() => vi.unstubAllEnvs());

  it.each(["android", "ios"])("%s에서 customData만 전달하고 보상 이벤트보다 닫힘을 기다린다", async (platform) => {
    sdk.platform = platform;
    const { showRewardAd } = await import("./native");
    const completed = vi.fn();
    const result = showRewardAd(session, new AbortController().signal).then(completed);
    await vi.waitFor(() => expect(sdk.show).toHaveBeenCalledOnce());
    expect(completed).not.toHaveBeenCalled();
    expect(sdk.prepare).toHaveBeenCalledWith({ adId: platform === "ios" ? "ca-app-pub-4/6" : "ca-app-pub-1/3", ssv: { customData: session.sessionKey } });
    sdk.listeners.get("dismissed")?.();
    sdk.listeners.get("dismissed")?.();
    await result;
    expect(completed).toHaveBeenCalledOnce();
    expect(sdk.listeners.size).toBe(0);
  });

  it("보상 이벤트 없이 광고를 닫아도 서버 확인 단계로 반환한다", async () => {
    sdk.show.mockReturnValue(new Promise(() => {}));
    const { showRewardAd } = await import("./native");
    const result = showRewardAd(session, new AbortController().signal);
    await vi.waitFor(() => expect(sdk.show).toHaveBeenCalledOnce());
    sdk.listeners.get("dismissed")?.();
    await expect(result).resolves.toBeUndefined();
    expect(sdk.listeners.size).toBe(0);
  });

  it("표시 실패 시 모든 리스너를 정리한다", async () => {
    sdk.show.mockRejectedValue(new Error("표시 실패"));
    const { showRewardAd } = await import("./native");
    await expect(showRewardAd(session, new AbortController().signal)).rejects.toThrow("표시 실패");
    expect(sdk.listeners.size).toBe(0);
  });

  it("취소한 화면으로 광고 결과를 전달하지 않는다", async () => {
    const { showRewardAd } = await import("./native");
    const controller = new AbortController();
    const result = showRewardAd(session, controller.signal);
    const assertion = expect(result).rejects.toThrow();
    await vi.waitFor(() => expect(sdk.show).toHaveBeenCalledOnce());
    controller.abort();
    await assertion;
    expect(sdk.listeners.size).toBe(0);
  });

  it("웹과 설정 미완료 환경은 광고 진입을 허용하지 않는다", async () => {
    const { isAdRewardAvailable } = await import("./native");
    expect(isAdRewardAvailable()).toBe(true);
    sdk.native = false;
    expect(isAdRewardAvailable()).toBe(false);
    sdk.native = true;
    vi.stubEnv("VITE_AD_REWARDS_ENABLED", "false");
    expect(isAdRewardAvailable()).toBe(false);
    vi.stubEnv("VITE_AD_REWARDS_ENABLED", "true");
    vi.stubEnv("VITE_ADMOB_ANDROID_APP_ID", "");
    expect(isAdRewardAvailable()).toBe(false);
  });

  it("동의가 필요하면 동의 창을 열고 광고 요청 허용 여부를 확인한다", async () => {
    const { initializeRewardAds } = await import("./native");
    sdk.consent.mockResolvedValue({ canRequestAds: false, status: "REQUIRED", isConsentFormAvailable: true });
    sdk.form.mockResolvedValue({ canRequestAds: false });
    await expect(initializeRewardAds()).rejects.toThrow();
    expect(sdk.form).toHaveBeenCalledOnce();
    sdk.form.mockResolvedValue({ canRequestAds: true });
    await expect(initializeRewardAds()).resolves.toBeUndefined();
    expect(sdk.initialize).toHaveBeenCalledOnce();
  });
});
