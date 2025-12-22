import { motion } from "motion/react";

// 뒤로가기 버튼과 타이틀이 있는 헤더
import { useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon, MenuIcon } from "./Icons";

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
  return (
    // 음수 마진으로 본문 패딩 무시
    <header className="relative text-center -mx-padding-x-m p-padding-y-s bg-surface-base border-b border-b-border-base text-label-l text-text-secondary">
      {showBackButton && (
        <button
          className="absolute left-padding-x-s"
          onClick={() => router.history.back()}
        >
          <ArrowLeftIcon />
        </button>
      )}
      {showMenuButton && (
        <button className="absolute right-padding-x-s">
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
