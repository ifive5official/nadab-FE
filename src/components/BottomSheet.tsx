// 아래에서 열리는 창
// 좋아요 및 댓글 목록 보기에서 사용
import useBottomSheetStore from "@/store/bottomSheetStore";
import { useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence, useDragControls } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function BottomSheet() {
  const { isOpen, config, closeBottomSheet } = useBottomSheetStore();
  const location = useLocation();

  const dragControls = useDragControls();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isScrollAtTop, setIsScrollAtTop] = useState(true);

  // 콘텐츠 내부 스크롤 감지 함수
  function handleContentScroll() {
    if (contentRef.current) {
      setIsScrollAtTop(contentRef.current.scrollTop <= 0);
    }
  }

  // 하단에서 올라오는 애니메이션으로 인한 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    closeBottomSheet();
  }, [location.pathname, closeBottomSheet]);

  return createPortal(
    <AnimatePresence>
      {isOpen && config && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="z-20 absolute inset-0 bg-neutral-dark-50"
            onClick={closeBottomSheet}
          />
          <motion.div
            className="z-30 absolute bottom-0 inset-x-0 h-[calc((732/796)*100*var(--dvh))] pb-(--safe-bottom) sm:mx-auto sm:w-[412px] bg-surface-base dark:bg-surface-layer-2 rounded-t-3xl flex flex-col"
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }} // 위로는 안올라가고 아래로만 내려가게 제한
            dragElastic={{ top: 0, bottom: 0.5 }} // 아래로 당길 때 쫀득한 저항감 부여
            onDragEnd={(_, info) => {
              if (info.offset.y > 150 || info.velocity.y > 500) {
                closeBottomSheet();
                setIsScrollAtTop(true);
              }
            }}
          >
            {/* 빈 공간 - 항상 드래그 가능 */}
            <div
              className="w-full flex flex-col items-center pt-padding-y-m px-padding-x-m"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-10 h-[5px] rounded-[20px] bg-[#D9D9D9]" />
              <p className="py-padding-y-s text-label-l">{config.title}</p>
            </div>
            {/* 컨텐츠 영역 - 스크롤이 없거나 맨 위에 있을 때만 드래그 가능 */}
            <div
              className="overflow-y-auto flex-1 px-padding-x-m py-padding-y-m"
              ref={contentRef}
              onScroll={handleContentScroll}
              onPointerDown={(e) => {
                if (isScrollAtTop) {
                  dragControls.start(e);
                }
              }}
            >
              {config.content}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("modal-root")!,
  );
}
