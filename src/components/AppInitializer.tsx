// 테마 불러오기 및 capacitor 초기화
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
const ThemeManager = registerPlugin<any>("ThemeManager");

async function changeStatusBarAreaColor(hexColor: string) {
  try {
    await ThemeManager.setRootBackgroundColor({ color: hexColor });
  } catch (e) {
    console.error(e);
  }
}

// Todo: 네트워크 에러 처리 로직도 여기로 옮기기
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
        await SplashScreen.hide();

        await SystemBars.setStyle({
          style: isDarkMode ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
        });
        await changeStatusBarAreaColor(isDarkMode ? "#000000" : "#FFFFFF");
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
    async function registerNotifications() {
      const perm = await PushNotifications.checkPermissions();
      if (perm.receive === "granted") {
        registerPush();
      }
    }
    registerNotifications();
  }, [registerPush]);

  // 네트워크 상태 확인
  //   useEffect(() => {
  //     if (!Capacitor.isNativePlatform()) {
  //       return;
  //     }

  //     Network.getStatus().then((status) => setIsOnline(status.connected));

  //     Network.addListener("networkStatusChange", (status) => {
  //       setIsOnline(status.connected);
  //     });

  //     if (isOnline) {
  //       // 네트워크가 다시 연결되면, 라우터에게 현재 페이지의 beforeLoad/loader를 다시 실행하라고 명령
  //       router.invalidate();
  //     }

  //     return () => {
  //       Network.removeAllListeners();
  //     };
  //   }, [isOnline, router]);

  // 스플래시 스크린 닫기
  useEffect(() => {
    async function hideSplash() {
      setTimeout(async () => {
        await SplashScreen.hide();
      }, 300);
    }
    if (Capacitor.isNativePlatform()) {
      hideSplash();
    }
  }, []);
  return null;
}
