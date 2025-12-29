import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import ErrorModal from "@/components/ErrorModal";
import type { QueryClient } from "@tanstack/react-query";
import useThemeStore from "@/store/useThemeStore";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  // 다크모드 적용
  const isDarkMode = useThemeStore.use.isDarkMode();

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <>
      <div className="min-h-dvh w-vw flex bg-surface-base">
        {/* 상단 패딩 - 헤더 자리 띄움 */}
        {/* 하단 패딩 넣은 이유 - 모바일 사파리 하단바 때문에 안 띄우면 이상함ㅜㅜ */}
        <div className="w-dvw sm:w-[412px] sm:mx-auto pt-header-height  overflow-x-hidden">
          <Outlet />

          <ErrorModal />
        </div>
      </div>
      <Sidebar />
    </>
  );
}
