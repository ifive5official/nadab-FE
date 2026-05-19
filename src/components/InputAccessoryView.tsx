// 키보드 위에 올라오는 악세서리 뷰
// 현재는 질문 답변 시에만 사용
import { useEffect, useState } from "react";
import InlineButton from "./InlineButton";
import { motion, AnimatePresence } from "motion/react";
import { CameraIcon, CloseFilledIcon, GalleryIcon } from "./Icons";
import { useImageUploader } from "@/hooks/useImageUpload";
import ProfileImg from "./ProfileImg";

type Props = {
  imageUploader: ReturnType<typeof useImageUploader>;
  isLoading: boolean; // 완료 시 호출하는 api가 로딩 중인지
  onComplete: () => void;
};

export default function InputAccessoryView({
  imageUploader,
  isLoading,
  onComplete,
}: Props) {
  const [bottomOffset, setBottomOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const {
    tempImageUrl,
    clearImage,
    isCropping,
    isUploading,
    handleNativeUpload,
  } = imageUploader;

  useEffect(() => {
    const handleViewportChange = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;

      const offset =
        window.innerHeight - (viewport.height + viewport.offsetTop);

      const keyboardOpen = window.innerHeight - viewport.height > 100;

      setIsVisible(keyboardOpen);
      setBottomOffset(Math.max(0, offset));
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
      window.visualViewport.addEventListener("scroll", handleViewportChange);
      handleViewportChange();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportChange,
        );
        window.visualViewport.removeEventListener(
          "scroll",
          handleViewportChange,
        );
      }
    };
  }, []);

  function handleHideKeyboard() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur(); // 키보드 닫기
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            paddingBottom: `calc(${bottomOffset}px + var(--spacing-padding-y-s))`,
          }}
          className="fixed bottom-0 inset-x-0 px-padding-x-m pt-padding-y-s bg-surface-layer-1 border border-border-base flex gap-gap-x-m items-center"
          // 엑세서리 바 누를 때 포커스 이탈 방지
          onPointerDown={(e) => e.preventDefault()}
        >
          {tempImageUrl ? (
            <div className="relative">
              <ProfileImg width={45} src={tempImageUrl} />
              <button
                onClick={clearImage}
                className="absolute top-0 -right-1.5 bg-surface-base h-[18px] aspect-square rounded-full"
              >
                <CloseFilledIcon size={12} />
              </button>
            </div>
          ) : isCropping ? (
            <div className="h-[45px] aspect-square rounded-full animate-pulse" />
          ) : (
            <button
              onClick={() => {
                handleHideKeyboard();
                handleNativeUpload("camera");
              }}
              className="h-[45px] aspect-square rounded-full bg-surface-base border border-border-base flex items-center justify-center"
            >
              <CameraIcon />
            </button>
          )}

          <button
            onClick={() => {
              handleHideKeyboard();
              handleNativeUpload("gallery");
            }}
            className="h-[45px] aspect-square rounded-full bg-surface-base border border-border-base flex items-center justify-center"
          >
            <GalleryIcon />
          </button>
          <InlineButton
            isLoading={isCropping || isUploading || isLoading}
            onClick={onComplete}
            onMouseDown={(e) => {
              e.preventDefault(); // iOS에서 키보드 사라짐 방지
              e.stopPropagation();
            }}
            className="ml-auto"
          >
            완료
          </InlineButton>
          <div className="absolute bottom-0" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
