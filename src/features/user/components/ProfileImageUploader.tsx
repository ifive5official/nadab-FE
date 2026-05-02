// 프로필 이미지 업로드 컴포넌트
// 온보딩 및 마이페이지 프로필 수정 페이지에서 사용
import { useRef } from "react";
import clsx from "clsx";
import ProfileImg from "@/components/ProfileImg";
import useToastStore from "@/store/toastStore";

import { Capacitor } from "@capacitor/core";
import { CameraSource } from "@capacitor/camera"; // 추가
import useBottomModalStore from "@/store/bottomModalStore";
import useModalStore from "@/store/modalStore";
import { useImageUploader } from "@/hooks/useImageUpload";

type Props = {
  mode: "create" | "edit";
  initialProfileImgUrl?: string;
  onSuccess: (url: string) => void;
  className?: string;
};

export default function ProfileImageUploader({
  mode,
  initialProfileImgUrl = undefined,
  onSuccess,
  className,
}: Props) {
  const isNative = Capacitor.isNativePlatform();

  const { showError } = useModalStore();
  const { showBottomModal, closeBottomModal } = useBottomModalStore();
  const { showToast } = useToastStore();
  const albumInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const {
    imageUrl,
    setImageUrl,
    isUploading,
    handleWebFileChange,
    handleNativeUpload,
  } = useImageUploader({
    apiUrl: "/api/v1/user/me/profile-image/upload-url",
    initialImageUrl: initialProfileImgUrl,
    onUpload: closeBottomModal,
    onUploadSuccess: (url: string) => {
      onSuccess(url);
      showToast({
        message: "프로필 사진이 추가되었어요.",
        bottom:
          "bottom-[calc(var(--spacing-margin-y-xxxl)+var(--safe-bottom))]",
      });
    },
    onUploadError: (e) => {
      if (e.message?.toLowerCase().includes("cancelled")) {
        return;
      }
      console.error(e);
      if (
        isNative &&
        (e.message.includes("denied") || e.message.includes("permission"))
      ) {
        closeBottomModal();
        showToast({
          message: "설정에서 카메라 권한을 허용해 주세요.",
          bottom:
            "bottom-[calc(var(--spacing-margin-y-xxxl)+var(--safe-bottom))]",
        });
      } else {
        showError(
          "이미지 업로드 중 문제가 발생했어요.",
          "다시 한번 시도해 주세요.",
        );
      }
    },
  });

  const baseModalItems = [
    {
      label: "앨범에서 사진 선택",
      onClick: () => {
        if (isNative) {
          handleNativeUpload(CameraSource.Photos);
        } else {
          albumInputRef.current?.click();
        }
      },
    },
    {
      label: "사진 찍기",
      onClick: () => {
        if (isNative) {
          handleNativeUpload(CameraSource.Camera);
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
            setImageUrl(undefined);
            onSuccess("");
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
      {!isUploading && <ProfileImg width={64} src={imageUrl} />}
      {isUploading && (
        <div className="bg-neutral-300 h-16 w-16 rounded-full animate-pulse" />
      )}
      <button
        type="button"
        className="text-button-tertiary-text-default text-label-m underline"
        onClick={() => showBottomModal(bottomModalConfig)}
        disabled={isUploading}
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
    </div>
  );
}
