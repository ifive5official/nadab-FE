import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import useThemeStore from "@/store/useThemeStore";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import ErrorPage from "@/components/ErrorPage";
import { Capacitor, SystemBars, SystemBarsStyle } from "@capacitor/core";
import { StatusBar } from "@capacitor/status-bar";
import { BackButtonHandler } from "@/hooks/backButtonHandler";
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
        <Outlet />
        <Modal />
        <Toast />
      </div>
      <Sidebar />
    </>
  );
}
