/**
 * @description 화면 중앙에 뜨고 아이콘 및 버튼이 있는 모달 컴포넌트
 * @note 전역에 컴포넌트를 하나 두고 zustand store로 내용 및 열림 상태를 관리
 */
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import BlockButton from "./BlockButton";
import useModalStore from "@/store/modalStore";
import { useLocation } from "@tanstack/react-router";

export default function Modal() {
  const { isOpen, closeModal, config } = useModalStore();
  const location = useLocation();
  const lastPathname = useRef(location.pathname);

  // 모달 떠 있을 동안 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 기본적으로 페이지 이동 시 모달 닫되
  // 홈에서 소셜 로그인 에러 시 모달 띄우기 위해 에러 처리함
  useEffect(() => {
    if (lastPathname.current !== location.pathname) {
      if (!config?.openOnNavigate) {
        closeModal();
      }
      lastPathname.current = location.pathname;
    }
  }, [location.pathname, config?.openOnNavigate, closeModal]);

  const Icon = config?.icon;

  return createPortal(
    <AnimatePresence>
      {isOpen && config && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="z-40 fixed inset-0 bg-neutral-dark-50"
            // onClick={onClose}
          />
          <motion.div
            className="z-50 fixed top-1/2 -translate-y-1/2 inset-x-padding-x-m sm:mx-auto sm:w-[412px] flex flex-col items-center bg-surface-base dark:bg-surface-layer-2 shadow-3 border border-border-base rounded-2xl text-text-primary px-padding-x-xl py-padding-y-xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {/* 아이콘, 제목, 본문 */}
            <div className="flex flex-col items-center gap-margin-y-s">
              {Icon && <Icon />}
              <p className="text-label-l whitespace-pre-line text-center">
                {config.title}
              </p>
              <p className="text-caption-m">{config.children}</p>
            </div>
            {/* 버튼(1~2개, 개수에 따라 자동 스타일링) */}
            <div className="w-full flex gap-gap-x-s mt-gap-y-xl">
              {config.buttons.length === 1 && (
                <BlockButton onClick={config.buttons[0].onClick}>
                  {config.buttons[0].label}
                </BlockButton>
              )}
              {config.buttons.length === 2 && (
                <>
                  <BlockButton
                    variant="secondary"
                    onClick={config.buttons[0].onClick}
                  >
                    {config.buttons[0].label}
                  </BlockButton>
                  <BlockButton onClick={config.buttons[1].onClick}>
                    {config.buttons[1].label}
                  </BlockButton>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("modal-root")!,
  );
}
