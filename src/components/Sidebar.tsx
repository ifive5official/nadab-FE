import clsx from "clsx";
import {
  CalendarMenuIcon,
  ChevronRightIcon,
  HomeMenuIcon,
  NoticeMenuIcon,
  ReportMenuIcon,
  SocialMenuIcon,
} from "./Icons";
import { Link, useLocation } from "@tanstack/react-router";
import useSidebarStore from "@/store/sidebarStore";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";

const MENU_ITEMS = [
  { to: "/", label: "홈", icon: HomeMenuIcon },
  { to: "/report", label: "리포트", icon: ReportMenuIcon },
  { to: "/social", label: "소셜", icon: SocialMenuIcon },
  { to: "/calendar", label: "캘린더", icon: CalendarMenuIcon },
  {
    to: "https://peat-language-671.notion.site/2e33409bb9b6802fb2e8f474e8cfd162",
    label: "공지사항",
    icon: NoticeMenuIcon,
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
              className="fixed z-5 inset-y-0 right-0 sm:right-[calc((100vw-420px)/2)] w-[clamp(calc(320px*0.5),calc((320/390)*100vw),calc(320px*1.2))] sm:w-[320px] bg-surface-base dark:bg-surface-layer-1 px-padding-x-m flex flex-col"
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
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  isExternal?: boolean;
  children: string;
};

function MenuItem({ to, icon: Icon, isExternal, children }: MenuItemProps) {
  return (
    <>
      {isExternal ? (
        <a href={to}>
          <li
            className={clsx(
              "flex gap-gap-x-s px-padding-x-xs py-padding-y-xs rounded-lg"
            )}
          >
            <Icon />
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
                    ? "text-brand-primary bg-brand-primary-alpha-10"
                    : "text-text-primary"
                )}
              >
                <Icon />
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
