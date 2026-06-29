/**
 * @description 테마 불러오기, Capacitor 초기화, 푸쉬알림 연동
 * @props 라우트 밖에서 실행되기 때문에 라우터 콘텍스트를 전달받음
 * @page 앱 시작 시 전역에서 한 번 실행됨
 * @note 추후 네트워크 에러 처리 로직 옮기는 것 고려
 */

import useThemeStore from "@/store/useThemeStore";
import { useEffect } from "react";
import type { AnyRouter } from "@tanstack/react-router";
import { Capacitor, SystemBars, SystemBarsStyle } from "@capacitor/core";
import { registerBackButtonHandler } from "@/hooks/backButtonHandler";
// import { Network } from "@capacitor/network";
import { registerPlugin } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { PushNotifications } from "@capacitor/push-notifications";
import { usePushNotifications } from "@/hooks/usePushManager";

// status bar 색상 변경 용 커스텀 플러그인
/* eslint-disable @typescript-eslint/no-explicit-any */
let ThemeManager: any;
try {
  ThemeManager = registerPlugin<any>("ThemeManager");
} catch (e) {
  console.warn("ThemeManager plugin not found");
}

async function changeStatusBarAreaColor(hexColor: string) {
  if (!ThemeManager) return;
  try {
    await ThemeManager.setRootBackgroundColor({ color: hexColor });
  } catch (e) {
    console.error(e);
  }
}

// Todo: 네트워크 에러 처리 로직도 여기로 옮기기?
export default function AppInitializer({ router }: { router: AnyRouter }) {
  //   const [isOnline, setIsOnline] = useState(true);
  const platform = Capacitor.getPlatform();
  document.documentElement.classList.add(`cap-${platform}`);

  const { registerPush } = usePushNotifications();

  // 뒤로가기 버튼과 히스토리 api 연동
  useEffect(() => {
    const handlerPromise = registerBackButtonHandler(router);

    return () => {
      handlerPromise.then((h) => h.remove());
    };
  }, [router]);

  // 다크모드 적용
  const isDarkMode = useThemeStore.use.isDarkMode();

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (Capacitor.isNativePlatform()) {
      async function syncSystemBars() {
        try {
          await SplashScreen.hide();

          await SystemBars.setStyle({
            style: isDarkMode ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
          });
          await changeStatusBarAreaColor(isDarkMode ? "#000000" : "#FFFFFF");
        } catch (e) {
          console.error("Initialization sync error:", e);
          await SplashScreen.hide();
        }
      }
      syncSystemBars();

      // 구형 기기에서 첫 접속 시 테마가 바뀌지 않는 문제 대응
      const timer = setTimeout(() => {
        syncSystemBars();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isDarkMode]);

  // 푸쉬알림 리스너 등록 및 토큰 갱신
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    async function registerNotifications() {
      try {
        const perm = await PushNotifications.checkPermissions();
        if (perm.receive === "granted") {
          registerPush();
        }
      } catch (e) {
        console.error("Push notification check error:", e);
      }
    }
    if (Capacitor.isNativePlatform()) {
      registerNotifications();
    }
  }, [registerPush]);

  // 스플래시 스크린 닫기
  useEffect(() => {
    async function hideSplash() {
      try {
        setTimeout(async () => {
          await SplashScreen.hide();
        }, 300);
      } catch (e) {
        console.error("Splash hide error:", e);
      }
    }

    // Failsafe: force hide after 3 seconds regardless of initialization state
    const failsafeTimer = setTimeout(async () => {
      if (Capacitor.isNativePlatform()) {
        await SplashScreen.hide();
        console.warn("Splash screen hidden by failsafe timer");
      }
    }, 3000);

    if (Capacitor.isNativePlatform()) {
      hideSplash();
    }

    return () => clearTimeout(failsafeTimer);
  }, []);
  return null;
}
