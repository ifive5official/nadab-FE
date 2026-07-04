/**
 * @description 각종 헤더 모음
 * @note Todo: 리펙토링 및 파일 분리
 */

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

type MainHeaderProps = {
  profileImgUrl: string | undefined;
};

type NotificationsRes = components["schemas"]["UnreadCountResponse"];

// "NADAB" 로고가 있는 메인 헤더
// 메인 4게 페이지(홈, 리포트, 소셜, 캘린더) 에서 사용
export function MainHeader({ profileImgUrl }: MainHeaderProps) {
  const openSidebar = useSidebarStore.use.openSidebar();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [{ data: crystalData }, { data: notificationsData }] = useQueries({
    queries: [
      crystalsOptions,
      {
        queryKey: ["currentUser", "notifications", "unreadCount"],
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
      {/* 알림 개수 및 알림함 링크 */}
      <Link to="/notifications" className="ml-auto">
        <button className="relative">
          <BellIcon />
          {unreadNotificationCnt > 0 && (
            <div
              className={clsx(
                "absolute top-0 left-3.5 flex justify-center items-center bg-brand-primary rounded-full h-3.5 text-badge text-white border border-white",
                unreadNotificationCnt < 10 ? "w-3.5" : "w-[22px]",
              )}
            >
              {unreadNotificationCnt > 10 ? "10+" : unreadNotificationCnt}
            </div>
          )}
        </button>
      </Link>
      {/* 사이드바 버튼 */}
      <button onClick={openSidebar}>
        <MenuIcon />
      </button>
      {/* 프로필 이미지 - 클릭 시 작은 메뉴 띄움 */}
      <button
        data-coachmark="home-profile-button"
        className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full p-0"
        onClick={() => setIsAccountMenuOpen(true)}
      >
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

// 프로필 이미지 클릭 시 뜨는 작은 메뉴
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
          <div
            data-coachmark="profile-menu-backdrop"
            className="z-20 fixed inset-0"
            onClick={onClose}
          />
          {/* 헤더 영역만큼 비워두기*/}
          <div className="z-30 fixed top-[calc(var(--spacing-header-height)+var(--safe-top))] right-padding-x-m sm:right-[calc((100vw-420px)/2+var(--spacing-padding-x-m))]">
            <div className="flex flex-col w-fit px-padding-x-s bg-surface-base dark:bg-neutral-700 rounded-lg shadow-4">
              <div
                data-coachmark="profile-crystal-row"
                className="-mx-padding-x-s px-padding-x-s py-padding-y-xs flex items-center gap-gap-x-s"
              >
                <span className="text-caption-s text-text-tertiary">
                  크리스탈 개수
                </span>
                <CrystalBadge crystals={crystals} />
              </div>
              <div className="border-b border-b-border-base dark:border-b-border-layer-3" />
              <nav className="contents">
                <Link
                  to="/account"
                  data-coachmark="profile-mypage-row"
                  className="-mx-padding-x-s block px-padding-x-s"
                >
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
// 메인 4개 페이지가 아닌 대부분의 페이지에서 사용
// search variant는 친구 및 기록 검색 페이지에서 사용하며 children으로 검색창 받음
type SubHeaderProps = {
  variant?: "sub" | "search";
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showCloseButton?: boolean;
  onBackClick?: () => void;
  children: React.ReactNode;
};

export function SubHeader({
  variant = "sub",
  showBackButton = true,
  showMenuButton = true,
  showCloseButton = false,
  onBackClick,
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
      {/* 뒤로가기 */}
      <div className="px-padding-x-s w-6 box-content flex items-center justify-center">
        {showBackButton && (
          <button onClick={onBackClick ?? (() => router.history.back())}>
            <ArrowLeftIcon />
          </button>
        )}
      </div>
      {/* 페이지 제목 */}
      <span className="flex-1 text-center">{children}</span>
      {/* 닫기 혹은 사이드바 버튼 */}
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

// 하단에 진행 바가 있는 헤더
// 현재는 회원가입 과정에서만 사용
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
