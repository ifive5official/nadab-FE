import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import useThemeStore from "@/store/useThemeStore";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import ErrorPage from "@/components/ErrorPage";

import { Capacitor, SystemBars, SystemBarsStyle } from "@capacitor/core";
import { StatusBar } from "@capacitor/status-bar";
import { BackButtonHandler } from "@/hooks/backButtonHandler";
import { Network } from "@capacitor/network";
// import { SplashScreen } from "@capacitor/splash-screen";

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: ErrorPage,
  notFoundComponent: () => <ErrorPage error={{ message: "404 Not Found" }} />,
});

function RootComponent() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  // 뒤로가기 버튼과 히스토리 api 연동
  if (Capacitor.isNativePlatform()) {
    BackButtonHandler();
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
        await StatusBar.setBackgroundColor({
          color: isDarkMode ? "#000000" : "#FFFFFF",
        });
      }
      syncSystemBars();
    }
  }, [isDarkMode]);

  // 네트워크 상태 확인
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    Network.getStatus().then((status) => setIsOnline(status.connected));

    Network.addListener("networkStatusChange", (status) => {
      setIsOnline(status.connected);
    });

    if (isOnline) {
      // 네트워크가 다시 연결되면, 라우터에게 현재 페이지의 beforeLoad/loader를 다시 실행하라고 명령
      router.invalidate();
    }

    return () => {
      Network.removeAllListeners();
    };
  }, [isOnline, router]);

  // // 스플래시 스크린 닫기
  // useEffect(() => {
  //   if (Capacitor.isNativePlatform()) {
  //     requestAnimationFrame(async () => {
  //       await SplashScreen.hide();
  //     });
  //   }
  // }, []);
  return (
    <>
      <div className="h-full w-full flex flex-col sm:w-[412px] sm:mx-auto overflow-hidden">
        {isOnline ? <Outlet /> : <ErrorPage error={{}} type="network" />}
        <Modal />
        <Toast />
      </div>
      <Sidebar />
    </>
  );
}
