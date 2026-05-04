// 키보드 위에 올라오는 악세서리 뷰
// 현재는 질문 답변 시에만 사용
import { Keyboard } from "@capacitor/keyboard";
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

  const { tempImageUrl, clearImage, isUploading, handleNativeUpload } =
    imageUploader;

  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    let showHandle: any;
    let hideHandle: any;

    const setupListeners = async () => {
      showHandle = await Keyboard.addListener("keyboardWillShow", () => {
        setIsVisible(true);
      });

      hideHandle = await Keyboard.addListener("keyboardWillHide", () => {
        setIsVisible(false);
        setBottomOffset(0);
      });
    };

    setupListeners();

    const handleViewportChange = () => {
      if (!window.visualViewport) return;

      const offset =
        window.innerHeight -
        (window.visualViewport.height + window.visualViewport.offsetTop);

      setBottomOffset(Math.max(0, offset));
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
      window.visualViewport.addEventListener("scroll", handleViewportChange);
    }

    return () => {
      if (showHandle) showHandle.remove();
      if (hideHandle) hideHandle.remove();
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ bottom: bottomOffset }}
          className="fixed bottom-0 inset-x-0 px-padding-x-m py-padding-y-s bg-surface-layer-1 border border-border-base flex gap-gap-x-m items-center"
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
          ) : isUploading ? (
            <div className="h-[45px] aspect-square rounded-full animate-pulse" />
          ) : (
            <button
              onClick={() => handleNativeUpload("camera")}
              className="h-[45px] aspect-square rounded-full bg-surface-base border border-border-base flex items-center justify-center"
            >
              <CameraIcon />
            </button>
          )}

          <button
            onClick={() => handleNativeUpload("gallery")}
            className="h-[45px] aspect-square rounded-full bg-surface-base border border-border-base flex items-center justify-center"
          >
            <GalleryIcon />
          </button>
          <InlineButton
            isLoading={isUploading || isLoading}
            onClick={() => {
              Keyboard.hide();
              onComplete();
            }}
            className="ml-auto"
          >
            완료
          </InlineButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
