import { useEffect, useSyncExternalStore } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import useAuthStore from "@/store/authStore";
import { adRewardFlow } from "./store";
import { AdRewardDialogView } from "./AdRewardDialogView";

// 광고 흐름의 상태와 인증·앱 생명주기를 안내 화면에 연결합니다.
export function AdRewardDialog() {
  const state = useSyncExternalStore(adRewardFlow.subscribe, adRewardFlow.getSnapshot);

  useEffect(() => {
    return useAuthStore.subscribe((next, previous) => {
      if (previous.accessToken && !next.accessToken) adRewardFlow.cancel();
    });
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let disposed = false;
    const handle = App.addListener("appStateChange", ({ isActive }) => adRewardFlow.setActive(isActive));
    void App.getState().then(({ isActive }) => {
      if (!disposed) adRewardFlow.setActive(isActive);
    }).catch(() => undefined);
    return () => {
      disposed = true;
      void handle.then((listener) => listener.remove()).catch(() => undefined);
      adRewardFlow.cancel();
    };
  }, []);

  return <AdRewardDialogView
    state={state}
    onCancel={() => adRewardFlow.cancel()}
    onWatch={() => void adRewardFlow.watch()}
    onCheck={() => adRewardFlow.check()}
  />;
}
