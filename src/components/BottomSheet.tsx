/**
 * @description 아래에서 열리고 드래그해서 내릴 수 있는 바텀시트
 * @props 콘텐츠는 props로 전달받음
 * @page 피드/상세보기 페이지에서 좋아요 및 댓글 목록 보기 시 사용
 * @note 현재 드래그 해서 내리는 동작이 불완전함.
 * 내부 콘텐츠 스크롤이 가능하면서도,
 * 내부 스크롤이 제일 위에 있을 때 아래로 드래그 하면 닫히는 기능 추가 필요.
 */
import useCommentInputStore from "@/store/commentInputStore";
import {
  useRouter,
  type LinkProps,
  type RegisteredRouter,
} from "@tanstack/react-router";
import clsx from "clsx";
import { motion, useDragControls } from "motion/react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Props = {
  title: string;
  children: React.ReactNode;
  hasBackground?: boolean;
  onCloseTo?: LinkProps<RegisteredRouter["routeTree"]>;
};

export default function BottomSheet({
  title,
  children,
  hasBackground = true,
  onCloseTo,
}: Props) {
  const router = useRouter();
  function handleClose() {
    if (onCloseTo) {
      router.navigate({
        ...onCloseTo,
        replace: true,
      });
    } else {
      router.history.back();
    }
  }
  const dragControls = useDragControls();
  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollTopSignal } = useCommentInputStore();

  // 댓글 작성 시 스크롤 위로 올리기 위함
  useEffect(() => {
    contentRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [scrollTopSignal]);

  // 스크롤 시 댓글창 닫기
  function handleScroll() {
    const activeEl = document.activeElement as HTMLElement;
    if (activeEl && activeEl.tagName === "INPUT") {
      activeEl.blur();
    }
  }

  // 하단에서 올라오는 애니메이션으로 인한 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={clsx(
          "z-15 absolute inset-0",
          hasBackground ? "bg-neutral-dark-50" : "bg-transparent",
        )}
        onClick={handleClose}
      />
      <motion.div
        className="z-17 absolute bottom-0 inset-x-0 h-[calc((732/796)*100*var(--dvh))] pb-(--safe-bottom) sm:mx-auto sm:w-[412px] bg-surface-base dark:bg-surface-layer-2 rounded-t-3xl flex flex-col"
        initial={{ y: 300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 300, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }} // 위로는 안올라가고 아래로만 내려가게 제한
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 150 || info.velocity.y > 500) {
            handleClose();
          }
        }}
      >
        {/* 빈 공간 */}
        <div
          className="w-full flex flex-col items-center pt-padding-y-m px-padding-x-m touch-none"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="w-10 h-[5px] rounded-[20px] bg-[#D9D9D9]" />
          <p className="py-padding-y-s text-label-l">{title}</p>
        </div>
        {/* 컨텐츠 영역 */}
        <div
          className="overflow-y-auto flex-1 px-padding-x-m py-padding-y-m"
          ref={contentRef}
          onPointerMove={handleScroll}
        >
          {children}
        </div>
      </motion.div>
    </>,
    document.getElementById("modal-root")!,
  );
}
