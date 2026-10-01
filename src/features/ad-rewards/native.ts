import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import type { AdRewardSession } from "./types";

let initialization: Promise<void> | undefined;
let nativeBusy = false;

// 구형 WebView에서도 취소된 광고 요청을 중단합니다.
function checkAborted(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("광고 시청이 취소되었어요.", "AbortError");
}

// 설정이 완료된 네이티브 앱에만 광고 보상 진입을 허용합니다.
export function isAdRewardAvailable() {
  const platform = Capacitor.getPlatform();
  const appId = platform === "ios" ? import.meta.env.VITE_ADMOB_IOS_APP_ID : import.meta.env.VITE_ADMOB_ANDROID_APP_ID;
  return Capacitor.isNativePlatform() && ["ios", "android"].includes(platform)
    && import.meta.env.VITE_AD_REWARDS_ENABLED === "true"
    && /^ca-app-pub-\d+~\d+$/.test(appId ?? "")
    && /^ca-app-pub-\d+\/\d+$/.test(getAdUnitId() ?? "");
}

// 현재 플랫폼의 보상형 광고 단위 ID를 선택합니다.
function getAdUnitId(): string | undefined {
  return Capacitor.getPlatform() === "ios"
    ? import.meta.env.VITE_ADMOB_IOS_REWARDED_ID
    : import.meta.env.VITE_ADMOB_ANDROID_REWARDED_ID;
}

// SDK를 한 번 초기화하고 광고 요청에 필요한 사용자 동의를 확인합니다.
export async function initializeRewardAds() {
  if (!isAdRewardAvailable()) throw new Error("광고를 지원하지 않는 환경이에요.");
  const { AdMob, AdmobConsentStatus } = await import("@capacitor-community/admob");
  initialization ??= AdMob.initialize().catch((error) => {
    initialization = undefined;
    throw error;
  });
  await initialization;
  let consent = await AdMob.requestConsentInfo();
  if (consent.isConsentFormAvailable && consent.status === AdmobConsentStatus.REQUIRED) {
    consent = await AdMob.showConsentForm();
  }
  if (!consent.canRequestAds) throw new Error("광고 이용 동의를 확인할 수 없어요.");
}

// 세션을 SSV에 연결하며 보상 콜백과 무관하게 광고가 닫힐 때 완료합니다.
export async function showRewardAd(session: AdRewardSession, signal: AbortSignal) {
  checkAborted(signal);
  if (nativeBusy) throw new Error("이미 광고를 준비하고 있어요.");
  nativeBusy = true;
  const handles: PluginListenerHandle[] = [];
  let abort: (() => void) | undefined;
  try {
    const { AdMob, RewardAdPluginEvents } = await import("@capacitor-community/admob");
    checkAborted(signal);
    let resolveClosed!: () => void;
    let rejectClosed!: (error: unknown) => void;
    const closed = new Promise<void>((resolve, reject) => {
      resolveClosed = resolve;
      rejectClosed = reject;
    });
    // 광고 준비 중 먼저 실패하더라도 처리되지 않은 Promise 오류를 남기지 않습니다.
    void closed.catch(() => undefined);
    abort = () => {
      rejectClosed(new DOMException("광고 시청이 취소되었어요.", "AbortError"));
      void Promise.allSettled(handles.map((handle) => handle.remove()));
    };
    signal.addEventListener("abort", abort, { once: true });
    handles.push(await AdMob.addListener(RewardAdPluginEvents.Dismissed, resolveClosed));
    handles.push(await AdMob.addListener(RewardAdPluginEvents.FailedToShow, rejectClosed));
    handles.push(await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, rejectClosed));
    checkAborted(signal);
    await AdMob.prepareRewardVideoAd({
      adId: getAdUnitId()!,
      ssv: { customData: session.sessionKey },
    });
    checkAborted(signal);
    // 이 Promise는 보상 획득 시 먼저 끝날 수 있으므로 닫힘 이벤트를 따로 기다립니다.
    void AdMob.showRewardVideoAd().catch(rejectClosed);
    await closed;
  } finally {
    if (abort) signal.removeEventListener("abort", abort);
    await Promise.allSettled(handles.map((handle) => handle.remove()));
    nativeBusy = false;
  }
}
