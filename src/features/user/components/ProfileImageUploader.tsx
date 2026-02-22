// 프로필 이미지 + 업로드 로직 모아둔 파일
import { useState, useRef } from "react";
import BottomModal from "@/components/BottomModal";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";
import type { ApiResponse } from "@/generated/api";
import axios from "axios";
import clsx from "clsx";
import ProfileImg from "@/components/ProfileImg";
import useToastStore from "@/store/toastStore";

import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera"; // 추가

type UploadUrlRes =
  components["schemas"]["CreateProfileImageUploadUrlResponse"];

type Props = {
  mode: "create" | "edit";
  initialProfileImgUrl?: string | undefined;
  onSuccess: (url: string) => void;
  className?: string;
};

export default function ProfileImageUploader({
  mode,
  initialProfileImgUrl = undefined,
  onSuccess,
  className,
}: Props) {
  const [profileImgUrl, setProfileImgUrl] = useState(initialProfileImgUrl);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToastStore();
  const albumInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const isNative = Capacitor.isNativePlatform();

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
          onClick: () => setIsModalOpen(false),
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
            setProfileImgUrl(undefined);
            onSuccess("");
            setIsModalOpen(false);
          },
        },
        ...baseModalItems,
      ],
    },
  };

  const { buttonText, modalTitle, modalItems } = uiConfig[mode];

  // presigned url 생성
  const getPresignedUrlMutation = useMutation({
    mutationFn: async (contentType: string) => {
      const res = await api.post<ApiResponse<UploadUrlRes>>(
        "/api/v1/user/me/profile-image/upload-url",
        {
          contentType,
        },
      );
      return res.data;
    },
  });

  // S3 PUT 업로드
  const uploadToS3Mutation = useMutation({
    mutationFn: async ({
      presignedUrl,
      file,
    }: {
      presignedUrl: string;
      file: File;
    }) => {
      await axios.put(presignedUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      return presignedUrl.split("?")[0];
    },
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("jpeg 또는 png만 업로드할 수 있습니다.");
      return;
    }

    setIsModalOpen(false);

    const previewUrl = URL.createObjectURL(file);
    setProfileImgUrl(previewUrl);

    try {
      const res = await getPresignedUrlMutation.mutateAsync(file.type);
      await uploadToS3Mutation.mutateAsync({
        presignedUrl: res.data?.objectKey ?? "",
        file,
      });
      onSuccess(res.data?.uploadUrl ?? "");
      showToast({
        message: "프로필 사진이 추가되었어요.",
        bottom:
          "bottom-[calc(var(--spacing-margin-y-xxxl)+var(--safe-bottom))]",
      });
    } catch (e) {
      console.error(e);
    } finally {
      e.target.value = "";
    }
  }

  // 네이티브 카메라 / 앨범 호출 로직
  const handleNativeUpload = async (source: CameraSource) => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: source,
      });

      if (image.webPath) {
        // 1. 프리뷰 설정
        setProfileImgUrl(image.webPath);

        // 2. S3 업로드를 위해 Blob으로 변환
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], `profile.${image.format}`, {
          type: `image/${image.format}`,
        });

        // 3. 기존 업로드 로직
        setIsModalOpen(false);
        const res = await getPresignedUrlMutation.mutateAsync(file.type);
        await uploadToS3Mutation.mutateAsync({
          presignedUrl: res.data?.objectKey ?? "",
          file,
        });
        onSuccess(res.data?.uploadUrl ?? "");
        showToast({
          message: "프로필 사진이 추가되었어요.",
          bottom:
            "bottom-[calc(var(--spacing-margin-y-xxxl)+var(--safe-bottom))]",
        });
      }
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (e: any) {
      console.error("Native Upload Error:", e);
      if (e.message.includes("denied") || e.message.includes("permission")) {
        setIsModalOpen(false);
        showToast({
          message: "설정에서 카메라 권한을 허용해 주세요.",
          bottom:
            "bottom-[calc(var(--spacing-margin-y-xxxl)+var(--safe-bottom))]",
        });
      }
    }
  };

  const isUploading =
    getPresignedUrlMutation.isPending || uploadToS3Mutation.isPending;

  return (
    <div className={clsx("flex flex-col items-center gap-gap-y-s", className)}>
      {!isUploading && <ProfileImg width={64} src={profileImgUrl} />}
      {isUploading && (
        <div className="bg-neutral-300 h-16 w-16 rounded-full animate-pulse" />
      )}
      <button
        type="button"
        className="text-button-tertiary-text-default text-label-m underline"
        onClick={() => setIsModalOpen(true)}
        disabled={isUploading}
      >
        {buttonText}
      </button>
      <input
        ref={albumInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png"
        capture="environment"
        onChange={handleFileChange}
      />

      <BottomModal
        isOpen={isModalOpen}
        title={modalTitle}
        items={modalItems}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
