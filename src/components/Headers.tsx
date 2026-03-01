import { motion } from "motion/react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  BellIcon,
  CloseIcon,
  LogoutMenuIcon,
  MenuIcon,
  MyPageMenuIcon,
} from "./Icons";
import useSidebarStore from "@/store/sidebarStore";
import ProfileImg from "./ProfileImg";
import { useState } from "react";
import { useLogoutMutation } from "@/features/auth/hooks/useLogoutMutation";
import clsx from "clsx";
import { useQueries } from "@tanstack/react-query";

import { CrystalBadge } from "./Badges";
import { crystalsOptions } from "@/features/user/quries";
import { api } from "@/lib/axios";
import type { ApiErrResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";

// Todo: 헤더 리펙토링하거나 파일 분리좀 하자...

type MainHeaderProps = {
  profileImgUrl: string | undefined;
};

type NotificationsRes = components["schemas"]["UnreadCountResponse"];

export function MainHeader({ profileImgUrl }: MainHeaderProps) {
  const openSidebar = useSidebarStore.use.openSidebar();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [{ data: crystalData }, { data: notificationsData }] = useQueries({
    queries: [
      crystalsOptions,
      {
        queryKey: ["currentUser", "notification"],
        queryFn: async () => {
          const res = await api.get<ApiErrResponse<NotificationsRes>>(
            "/api/v1/notifications/unread-count",
          );
          return res.data.data!;
        },
      },
    ],
  });
  const unreadNotificationCnt = notificationsData?.unreadCount ?? 0;
  const crystals = crystalData?.crystalBalance ?? 0;

  return (
    <header
      className={clsx(
        "shrink-0 z-10 flex items-center gap-gap-x-m",
        "px-padding-x-m w-full sm:w-[412px] h-header-height",
        "bg-surface-base border-b border-b-border-base text-label-l text-text-secondary",
      )}
    >
      <img src="/textLogo.png" className="w-[83.9px]" />
      <Link to="/notifications" className="ml-auto">
        <button className="relative">
          <BellIcon />
          {unreadNotificationCnt > 0 && (
            <div className="absolute top-0 -right-1 flex justify-center items-center bg-brand-primary rounded-full aspect-square h-3.5 text-badge text-white">
              {unreadNotificationCnt > 9 ? "9+" : unreadNotificationCnt}
            </div>
          )}
        </button>
      </Link>

      <button onClick={openSidebar}>
        <MenuIcon />
      </button>
      <button onClick={() => setIsAccountMenuOpen(true)}>
        <ProfileImg width={32} src={profileImgUrl} />
      </button>
      <AccountMenu
        isOpen={isAccountMenuOpen}
        onClose={() => setIsAccountMenuOpen(false)}
        crystals={crystals}
      />
    </header>
  );
}

// 프로필 클릭 시 뜨는 작은 메뉴
type AccountMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  crystals: number;
};
function AccountMenu({ isOpen, onClose, crystals }: AccountMenuProps) {
  const logoutMutation = useLogoutMutation();
  return (
    <>
      {isOpen && (
        <>
          <div className="z-20 fixed inset-0" onClick={onClose} />
          {/* 헤더 영역만큼 비워두기...*/}
          <div className="z-30 fixed top-header-height right-padding-x-m sm:right-[calc((100vw-420px)/2+var(--spacing-padding-x-m))]">
            <div className="flex flex-col top-0 w-fit px-padding-x-s py-padding-y-xs bg-surface-base dark:bg-neutral-700 rounded-lg shadow-4">
              <div className="p-padding-y-xxs flex items-center gap-gap-x-s border-b border-b-border-base dark:border-b-border-layer-3">
                <span className="text-caption-s text-text-tertiary">
                  크리스탈 개수
                </span>
                <CrystalBadge crystals={crystals} />
              </div>
              <nav className="contents">
                <Link to="/account">
                  <li className="flex items-center py-padding-y-xs gap-gap-x-xs">
                    <MyPageMenuIcon />
                    <span className="text-caption-m">마이페이지</span>
                  </li>
                </Link>
                <li
                  onClick={() => logoutMutation.mutate()}
                  className="flex items-center py-padding-y-xs gap-gap-x-xs cursor-pointer"
                >
                  <LogoutMenuIcon />
                  <span className="text-caption-m">로그아웃</span>
                </li>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// 뒤로가기 버튼과 타이틀이 있는 헤더
type SubHeaderProps = {
  variant?: "sub" | "search";
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
};

export function SubHeader({
  variant = "sub",
  showBackButton = true,
  showMenuButton = true,
  showCloseButton = false,
  children,
}: SubHeaderProps) {
  const router = useRouter();
  const openSidebar = useSidebarStore.use.openSidebar();

  return (
    <header
      className={clsx(
        "shrink-0 z-10 flex items-center",
        "w-full sm:w-[412px] h-header-height",
        "bg-surface-base text-label-l text-text-secondary",
        variant === "sub" ? "border-b border-b-border-base" : "",
      )}
    >
      <div className="px-padding-x-s w-6 box-content flex items-center justify-center">
        {showBackButton && (
          <button onClick={() => router.history.back()}>
            <ArrowLeftIcon />
          </button>
        )}
      </div>

      <span className="flex-1 text-center">{children}</span>
      {variant !== "search" && (
        <div className="px-padding-x-s w-6 box-content flex items-center justify-center">
          {showMenuButton && (
            <button onClick={openSidebar}>
              <MenuIcon />
            </button>
          )}
          {showCloseButton && (
            <Link to="/">
              <CloseIcon />
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export function ProgressHeader({ progress }: { progress: number }) {
  const router = useRouter();
  return (
    <>
      <header
        className={clsx(
          "relative shrink-0 z-10 flex items-center text-center",
          "w-full sm:w-[412px] h-header-height",
          "bg-surface-base text-label-l text-text-secondary",
        )}
      >
        <button
          className="absolute left-padding-x-s"
          onClick={() => router.history.back()}
        >
          <ArrowLeftIcon />
        </button>
        <div className="self-end h-1 w-full bg-surface-layer-1">
          <motion.div
            className="h-full bg-brand-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>
      </header>
    </>
  );
}
