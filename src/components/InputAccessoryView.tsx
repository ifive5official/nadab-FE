// 키보드 위에 올라오는 악세서리 뷰
// 현재는 질문 답변 시에만 사용
import { Keyboard } from "@capacitor/keyboard";
import { useEffect, useState } from "react";
import InlineButton from "./InlineButton";
import { motion, AnimatePresence } from "motion/react";
import { CameraIcon, CloseFilledIcon, GalleryIcon } from "./Icons";
import { Capacitor } from "@capacitor/core";
import { useImageUploader } from "@/hooks/useImageUpload";
import useModalStore from "@/store/modalStore";
import ProfileImg from "./ProfileImg";
import { CameraSource } from "@capacitor/camera";

export default function InputAccessoryView() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { showError } = useModalStore();

  const {
    imageUrl,
    setImageUrl,
    isUploading,
    // handleWebFileChange,
    handleNativeUpload,
  } = useImageUploader({
    apiUrl: "/api/v1/user/me/profile-image/upload-url",
    onUploadError: (e) => {
      if (e.message?.toLowerCase().includes("cancelled")) {
        return;
      }
      console.error(e);
      showError(
        "이미지 업로드 중 문제가 발생했어요.",
        "다시 한번 시도해 주세요.",
      );
    },
  });

  const platform = Capacitor.getPlatform();

  const transitions = {
    ios: {
      type: "tween",
      ease: [0.2, 0.8, 0.2, 1],
      duration: 0.25,
    },
    android: {
      type: "tween",
      ease: "linear",
      duration: 0.2,
    },
  } as const;

  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    let showHandle: any;
    let hideHandle: any;

    const setupListeners = async () => {
      showHandle = await Keyboard.addListener("keyboardWillShow", (info) => {
        setKeyboardHeight(info.keyboardHeight);
        setIsVisible(true);
      });

      hideHandle = await Keyboard.addListener("keyboardWillHide", () => {
        setKeyboardHeight(0);
        setIsVisible(false);
      });
    };

    setupListeners();

    return () => {
      if (showHandle) showHandle.remove();
      if (hideHandle) hideHandle.remove();
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -keyboardHeight, opacity: 1 }}
          exit={{ y: 0, opacity: 0 }}
          transition={transitions[platform === "ios" ? "ios" : "android"]}
          className="fixed bottom-0 inset-x-0 px-padding-x-m py-padding-y-s bg-surface-layer-1 border border-border-base flex gap-gap-x-m items-center"
          // 엑세서리 바 누를 때 포커스 이탈 방지
          onPointerDown={(e) => e.preventDefault()}
        >
          {imageUrl ? (
            <div className="relative">
              <ProfileImg width={45} src={imageUrl} />
              <button
                onClick={() => setImageUrl(undefined)}
                className="absolute top-0 -right-1.5 bg-surface-base h-[18px] aspect-square rounded-full"
              >
                <CloseFilledIcon size={12} />
              </button>
            </div>
          ) : isUploading ? (
            <div className="h-[45px] aspect-square rounded-full animate-pulse" />
          ) : (
            <button
              onClick={() => handleNativeUpload(CameraSource.Camera)}
              className="h-[45px] aspect-square rounded-full bg-surface-base border border-border-base flex items-center justify-center"
            >
              <CameraIcon />
            </button>
          )}

          <button
            onClick={() => handleNativeUpload(CameraSource.Photos)}
            className="h-[45px] aspect-square rounded-full bg-surface-base border border-border-base flex items-center justify-center"
          >
            <GalleryIcon />
          </button>
          <InlineButton onClick={() => Keyboard.hide()} className="ml-auto">
            완료
          </InlineButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
