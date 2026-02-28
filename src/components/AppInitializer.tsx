// 테마 불러오기 및 capacitor 초기화
import useThemeStore from "@/store/useThemeStore";
import { useEffect } from "react";
import type { AnyRouter } from "@tanstack/react-router";
import { Capacitor, SystemBars, SystemBarsStyle } from "@capacitor/core";
import { backButtonHandler } from "@/hooks/backButtonHandler";
// import { Network } from "@capacitor/network";
import { registerPlugin } from "@capacitor/core";
// import { SplashScreen } from "@capacitor/splash-screen";

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

  // 뒤로가기 버튼과 히스토리 api 연동
  if (Capacitor.isNativePlatform()) {
    backButtonHandler(router);
  }

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
        await SystemBars.setStyle({
          style: isDarkMode ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
        });
        await changeStatusBarAreaColor(isDarkMode ? "#000000" : "#FFFFFF");
      }
      syncSystemBars();
    }
  }, [isDarkMode]);

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

  // // 스플래시 스크린 닫기
  // useEffect(() => {
  //   if (Capacitor.isNativePlatform()) {
  //     requestAnimationFrame(async () => {
  //       await SplashScreen.hide();
  //     });
  //   }
  // }, []);
  return null;
}
