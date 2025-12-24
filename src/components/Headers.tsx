import { motion } from "motion/react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  GemFilledIcon,
  LogoutMenuIcon,
  MenuIcon,
  MyPageMenuIcon,
} from "./Icons";
import useSidebarStore from "@/store/sidebarStore";
import { ColoredTextLogo } from "./Logos";
import ProfileImg from "./ProfileImg";
import { useState } from "react";
import { useLogoutMutation } from "@/features/auth/hooks/useLogoutMutation";

type MainHeaderProps = {
  profileImgUrl: string | undefined;
};

export function MainHeader({ profileImgUrl }: MainHeaderProps) {
  const openSidebar = useSidebarStore.use.openSidebar();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  return (
    <>
      {/* 음수 마진으로 본문 패딩 무시 */}
      <header className="flex items-center gap-gap-x-m z-1 relative text-center -mx-padding-x-m p-padding-y-s bg-surface-base border-b border-b-border-base text-label-l text-text-secondary">
        <ColoredTextLogo width={54.3} />
        <button onClick={openSidebar} className="ml-auto">
          <MenuIcon />
        </button>
        <button onClick={() => setIsAccountMenuOpen(true)}>
          <ProfileImg width={32} src={profileImgUrl} />
        </button>
        <AccountMenu
          isOpen={isAccountMenuOpen}
          onClose={() => setIsAccountMenuOpen(false)}
        />
      </header>
    </>
  );
}

// 프로필 클릭 시 뜨는 작은 메뉴
type AccountMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};
function AccountMenu({ isOpen, onClose }: AccountMenuProps) {
  const logoutMutation = useLogoutMutation();
  return (
    <>
      {isOpen && (
        <>
          <div className="z-2 fixed inset-0" onClick={onClose} />
          {/* 헤더 영역만큼 비워두기...
          Todo: 더 좋은 방법이 없나... */}
          <div className="z-3 fixed top-[calc(var(--spacing-padding-y-xl)+32px)] right-padding-x-m sm:right-[calc((100vw-420px)/2+var(--spacing-padding-x-m))]">
            <div className=" grid grid-cols-1 auto-rows-fr top-0 w-fit px-padding-x-s py-padding-y-xs bg-surface-base rounded-lg shadow-4">
              <div className="flex items-center gap-gap-x-s border-b border-b-border-base">
                <span className="text-caption-s text-text-tertiary">
                  크리스탈 개수
                </span>
                <div className="flex items-center gap-gap-x-xs bg-button-secondary-bg-default rounded-xl px-padding-x-xs py-padding-y-xs">
                  <GemFilledIcon />
                  <span className="text-caption-s">100</span>
                </div>
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
  showBackButton?: boolean;
  showMenuButton?: boolean;
  children: React.ReactNode;
};

export function SubHeader({
  showBackButton = true,
  showMenuButton = true,
  children,
}: SubHeaderProps) {
  const router = useRouter();
  const openSidebar = useSidebarStore.use.openSidebar();

  return (
    // 음수 마진으로 본문 패딩 무시
    <header className="z-1 relative text-center -mx-padding-x-m p-padding-y-s bg-surface-base border-b border-b-border-base text-label-l text-text-secondary">
      {showBackButton && (
        <button
          className="absolute left-padding-x-s"
          onClick={() => router.history.back()}
        >
          <ArrowLeftIcon />
        </button>
      )}
      {showMenuButton && (
        <button onClick={openSidebar} className="absolute right-padding-x-s">
          <MenuIcon />
        </button>
      )}
      {children}
    </header>
  );
}

export function ProgressHeader({ progress }: { progress: number }) {
  const router = useRouter();
  return (
    <>
      <header className="relative text-center -mx-padding-x-m p-padding-y-s bg-surface-base text-label-l text-text-secondary">
        <button
          className="absolute left-padding-x-s"
          onClick={() => router.history.back()}
        >
          <ArrowLeftIcon />
        </button>
        ㅤ
      </header>
      <div className="h-1 bg-surface-layer-1 -mx-padding-x-m">
        <motion.div
          className="h-full bg-brand-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeOut" }}
        />
      </div>
    </>
  );
}
