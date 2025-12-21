// 프로필 이미지 + 업로드 로직 모아둔 파일
import { useState, useRef } from "react";
import BottomModal from "@/components/BottomModal";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";
import type { ApiResponse } from "@/generated/api";
import axios from "axios";
import Toast from "@/components/Toast";

type UploadUrlRes =
  components["schemas"]["CreateProfileImageUploadUrlResponse"];

type Props = {
  initialProfileImgUrl: string | undefined;
  onSuccess: (url: string) => void;
};

export default function ProfileImageUploader({
  initialProfileImgUrl,
  onSuccess,
}: Props) {
  const [profileImgUrl, setProfileImgUrl] = useState(initialProfileImgUrl);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [istoastopen, setIsToastOpen] = useState(false);

  const albumInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // presigned url 생성
  const getPresignedUrlMutation = useMutation({
    mutationFn: async (contentType: string) => {
      const res = await api.post<ApiResponse<UploadUrlRes>>(
        "/api/v1/user/me/profile-image/upload-url",
        {
          contentType,
        }
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
      setIsToastOpen(true);
    } catch (e) {
      console.error(e);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      e.target.value = "";
    }
  }

  const isUploading =
    getPresignedUrlMutation.isPending || uploadToS3Mutation.isPending;

  return (
    <div className="py-padding-y-xl flex flex-col items-center gap-gap-y-s">
      {!isUploading && (
        <img
          src={profileImgUrl || "/default-profile.png"}
          className="h-16 w-16 rounded-full object-cover"
        />
      )}
      {isUploading && (
        <div className="bg-neutral-300 h-16 w-16 rounded-full animate-pulse" />
      )}
      <button
        type="button"
        className="text-button-tertiary-text-default text-label-m underline"
        onClick={() => setIsModalOpen(true)}
        disabled={isUploading}
      >
        사진 추가
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
        title="프로필 사진 추가"
        items={[
          {
            label: "앨범에서 사진 선택",
            onClick: () => {
              albumInputRef.current?.click();
            },
          },
          {
            label: "사진 찍기",
            onClick: () => {
              cameraInputRef.current?.click();
            },
          },
          {
            label: "취소",
            onClick: () => setIsModalOpen(false),
          },
        ]}
        onClose={() => setIsModalOpen(false)}
      />
      <Toast
        isOpen={istoastopen}
        bottom="bottom-margin-y-xxxl"
        onClose={() => setIsToastOpen(false)}
        message="프로필 사진이 추가되었습니다."
      />
    </div>
  );
}
