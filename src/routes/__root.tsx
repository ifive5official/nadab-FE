import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import useThemeStore from "@/store/useThemeStore";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Modal from "@/components/Modal";

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
      <div className="min-h-full w-full flex">
        <div className="flex flex-col w-dvw sm:w-[412px] sm:mx-auto overflow-x-hidden">
          <Outlet />
          <Modal />
        </div>
      </div>
      <Sidebar />
    </>
  );
}
