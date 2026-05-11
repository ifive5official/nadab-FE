// 프로필 이미지 업로드 컴포넌트
// 온보딩 및 마이페이지 프로필 수정 페이지에서 사용
import { useRef } from "react";
import clsx from "clsx";
import ProfileImg from "@/components/ProfileImg";
import { Capacitor } from "@capacitor/core";
import useBottomModalStore from "@/store/bottomModalStore";
import { ImageCropper } from "@/components/ImageCropper";
import type { useProfileImageUpload } from "@/hooks/useProfileImageUpload";

type Props = {
  mode: "create" | "edit";
  imageUploader: ReturnType<typeof useProfileImageUpload>;
  className?: string;
};

export default function ProfileImageUploader({
  mode,
  imageUploader,
  className,
}: Props) {
  const isNative = Capacitor.isNativePlatform();
  const { showBottomModal, closeBottomModal } = useBottomModalStore();
  const albumInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const {
    tempImageUrl,
    clearImage,
    cropTarget,
    setCropTarget,
    handleCropComplete,
    isCropping,
    isUploading,
    handleWebFileChange,
    handleNativeUpload,
  } = imageUploader;

  const baseModalItems = [
    {
      label: "앨범에서 사진 선택",
      onClick: () => {
        if (isNative) {
          handleNativeUpload("gallery");
        } else {
          albumInputRef.current?.click();
        }
      },
    },
    {
      label: "사진 찍기",
      onClick: () => {
        if (isNative) {
          handleNativeUpload("camera");
        } else {
          cameraInputRef.current?.click();
        }
      },
    },
  ];

  const uiConfig = {
    create: {
      buttonText: "사진 추가",
      modalTitle: "프로필 사진 추가",
      modalItems: [
        ...baseModalItems,
        {
          label: "취소",
          onClick: () => closeBottomModal(),
        },
      ],
    },
    edit: {
      buttonText: "사진 변경",
      modalTitle: "프로필 사진 변경",
      modalItems: [
        {
          label: "기본 프로필로 변경",
          onClick: () => {
            clearImage();
            closeBottomModal();
          },
        },
        ...baseModalItems,
      ],
    },
  };

  const { buttonText, modalTitle, modalItems } = uiConfig[mode];
  const bottomModalConfig = {
    title: modalTitle,
    items: modalItems,
  };

  return (
    <div className={clsx("flex flex-col items-center gap-gap-y-s", className)}>
      {!isCropping && <ProfileImg width={64} src={tempImageUrl} />}
      {isCropping && (
        <div className="bg-neutral-300 h-16 w-16 rounded-full animate-pulse" />
      )}
      <button
        type="button"
        className="text-button-tertiary-text-default text-label-m underline"
        onClick={() => showBottomModal(bottomModalConfig)}
        disabled={isCropping || isUploading}
      >
        {buttonText}
      </button>
      <input
        ref={albumInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png"
        onChange={handleWebFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png"
        capture="environment"
        onChange={handleWebFileChange}
      />
      {cropTarget && (
        <ImageCropper
          image={cropTarget}
          onConfirm={handleCropComplete}
          onCancel={() => setCropTarget(null)}
        />
      )}
    </div>
  );
}
