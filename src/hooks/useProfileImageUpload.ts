import { useImageUploader } from "@/hooks/useImageUpload";
import useBottomModalStore from "@/store/bottomModalStore";
import useModalStore from "@/store/modalStore";
import useToastStore from "@/store/toastStore";
import { Capacitor } from "@capacitor/core";

export function useProfileImageUpload(initialProfileImgUrl?: string) {
  const { showError } = useModalStore();
  const { closeBottomModal } = useBottomModalStore();
  const { showToast } = useToastStore();

  const uploader = useImageUploader({
    apiUrl: "/api/v1/user/me/profile-image/upload-url",
    initialImageUrl: initialProfileImgUrl,
    onUpload: closeBottomModal,
    onCropSuccess: () => {
      showToast({
        message: "프로필 사진이 추가되었어요.",
        bottom:
          "bottom-[calc(var(--spacing-margin-y-xxxl)+var(--safe-bottom))]",
      });
    },
    onUploadError: (e) => {
      if (e.message?.toLowerCase().includes("canceled")) {
        return;
      }
      console.error(e);
      if (
        Capacitor.isNativePlatform() &&
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

  return uploader;
}
