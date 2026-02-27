import clsx from "clsx";
import { ChevronRightIcon } from "./Icons";
import { Link, useLocation } from "@tanstack/react-router";
import useSidebarStore from "@/store/sidebarStore";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";

import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

const MENU_ITEMS = [
  { to: "/", label: "홈", icon: "/icon/home.png" },
  { to: "/report", label: "리포트", icon: "/icon/report.png" },
  { to: "/social", label: "소셜", icon: "/icon/social.png" },
  { to: "/calendar", label: "캘린더", icon: "/icon/calendar.png" },
  {
    to: "https://peat-language-671.notion.site/2e33409bb9b6802fb2e8f474e8cfd162",
    label: "공지사항",
    icon: "/icon/notice.png",
    isExternal: true,
  },
] as const;

export default function Sidebar() {
  const isSidebarOpen = useSidebarStore.use.isSidebarOpen();
  const closeSidebar = useSidebarStore.use.closeSidebar();
  const location = useLocation();

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    return () => {
      closeSidebar();
    };
  }, [location.pathname, closeSidebar]);

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* 배경 검은색 부분 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed z-2 inset-0 bg-neutral-dark-50"
              onClick={closeSidebar}
            />
            {/* 사이드바 */}
            <motion.div
              className="fixed z-5 inset-y-0 right-0 sm:right-[calc((100vw-420px)/2)] w-[clamp(calc(320px*0.5),calc((320/390)*100vw),calc(320px*1.2))] sm:w-[320px] bg-surface-base dark:bg-surface-layer-1 px-padding-x-m pb-(--safe-bottom) flex flex-col"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {/* 헤더 영역만큼 비워두기*/}
              <nav className="flex-1 mt-header-height py-padding-y-xl flex flex-col gap-gap-y-xs">
                {MENU_ITEMS.map((item) => (
                  <MenuItem key={item.to} {...item}>
                    {item.label}
                  </MenuItem>
                ))}
              </nav>
              <div className="py-padding-y-m border-y border-y-interactive-border-default">
                {[
                  {
                    to: "https://docs.google.com/forms/d/e/1FAIpQLSfDuE6xR8Uu93fIt9DIWS4z6KYRa95PtDU7PJuD-DCG7Kk4ag/viewform",
                    label: "의견 남기기",
                  },
                  {
                    to: "https://www.instagram.com/nadab.app/",
                    label: "인스타그램 바로가기",
                  },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.to}
                    onClick={async (e) => {
                      if (Capacitor.isNativePlatform()) {
                        e.preventDefault();
                        await Browser.open({
                          url: item.to,
                        });
                      }
                    }}
                  >
                    <div className="flex justify-between px-padding-x-xs py-padding-y-xs">
                      <span className="text-caption-l text-text-secondary">
                        {item.label}
                      </span>
                      <span className="text-icon-muted">
                        <ChevronRightIcon />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
              <footer className="text-text-tertiary text-caption-s py-padding-y-m text-center">
                © Nadab All Rights Reserved
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

type MenuItemProps = {
  to: string;
  icon: string;
  isExternal?: boolean;
  children: string;
};

function MenuItem({ to, icon, isExternal, children }: MenuItemProps) {
  return (
    <>
      {isExternal ? (
        <a
          href={to}
          onClick={async (e) => {
            if (Capacitor.isNativePlatform()) {
              e.preventDefault();
              await Browser.open({ url: to });
            }
          }}
        >
          <li
            className={clsx(
              "flex gap-gap-x-s px-padding-x-xs py-padding-y-xs rounded-lg",
            )}
          >
            <img src={icon} alt="메뉴 아이콘" className="w-6 aspect-square" />
            <p className="mr-auto text-title-3">{children}</p>
            <ChevronRightIcon />
          </li>
        </a>
      ) : (
        <Link to={to}>
          {({ isActive }) => {
            return (
              <li
                className={clsx(
                  "flex gap-gap-x-s px-padding-x-xs py-padding-y-xs rounded-lg",
                  isActive
                    ? "text-brand-primary bg-surface-layer-1"
                    : "text-text-primary",
                )}
              >
                <img
                  src={icon}
                  alt="메뉴 아이콘"
                  className="w-6 aspect-square"
                />
                <p className="mr-auto text-title-3">{children}</p>
                <ChevronRightIcon />
              </li>
            );
          }}
        </Link>
      )}
    </>
  );
}
