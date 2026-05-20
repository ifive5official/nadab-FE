// 키보드 위에 올라오는 악세서리 뷰
// 질문 답변 사용
import InlineButton from "../../components/InlineButton";
import { motion, AnimatePresence } from "motion/react";
import {
  CameraIcon,
  CloseFilledIcon,
  GalleryIcon,
} from "../../components/Icons";
import { useImageUploader } from "@/hooks/useImageUpload";
import ProfileImg from "../../components/ProfileImg";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";

type Props = {
  imageUploader: ReturnType<typeof useImageUploader>;
  isLoading: boolean; // 완료 시 호출하는 api가 로딩 중인지
  onComplete: () => void;
};

export default function AnswerAccessoryView({
  imageUploader,
  isLoading,
  onComplete,
}: Props) {
  const { isVisible, bottomOffset } = useKeyboardOffset();

  const {
    tempImageUrl,
    clearImage,
    isCropping,
    isUploading,
    handleNativeUpload,
  } = imageUploader;

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
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
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
