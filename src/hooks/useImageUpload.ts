// 이미지 업로드 용 커스텀 훅
// 사진 촬영 및 갤러리 접근 지원
import type { ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { api } from "@/lib/axios";
import { getCroppedImg } from "@/lib/cropImage";
import { Camera } from "@capacitor/camera";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";

type UploadUrlRes =
  components["schemas"]["CreateProfileImageUploadUrlResponse"];

type ImageUploaderProps = {
  apiUrl: string;
  initialImageUrl?: string;
  onUpload?: () => void; // 이미지 선택 직후 동작(모달 닫는 등)
  onUploadSuccess?: (url: string) => void;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  onUploadError?: (error: any) => void;
};

export function useImageUploader({
  apiUrl,
  initialImageUrl,
  onUpload,
  onUploadSuccess,
  onUploadError,
}: ImageUploaderProps) {
  const [tempImageUrl, setTempImageUrl] = useState(initialImageUrl);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | undefined>(
    undefined,
  );
  const [cropTarget, setCropTarget] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // 크롭 완료 후 호출
  async function handleCropComplete(pixels: any) {
    const imageToCrop = cropTarget;
    setCropTarget(null);

    if (!imageToCrop) return;

    try {
      setIsCropping(true);
      const croppedBlob = await getCroppedImg(imageToCrop, pixels);

      const previewUrl = URL.createObjectURL(croppedBlob);
      setTempImageUrl(previewUrl);

      const file = new File([croppedBlob], "profile.jpg", {
        type: "image/jpeg",
      });

      await processUpload(file);
    } catch (err) {
      onUploadError?.(err);
    } finally {
      setIsCropping(false);
    }
  }

  // presigned url 생성
  const getPresignedUrlMutation = useMutation({
    mutationFn: async (contentType: string) => {
      const res = await api.post<ApiResponse<UploadUrlRes>>(apiUrl, {
        contentType,
      });
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
      file: File | Blob;
    }) => {
      await axios.put(presignedUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      return presignedUrl.split("?")[0];
    },
  });

  // 공통 업로드 프로세스
  async function processUpload(file: File | Blob) {
    const res = await getPresignedUrlMutation.mutateAsync(file.type);

    let presignedUrl = "";
    let uploadUrl = "";

    // 예외처리
    if (apiUrl.includes("/user/me/profile-image/upload-url")) {
      presignedUrl = res.data?.objectKey ?? "";
      uploadUrl = res.data?.uploadUrl ?? "";
    } else {
      presignedUrl = res.data?.uploadUrl ?? "";
      uploadUrl = res.data?.objectKey ?? "";
    }

    await uploadToS3Mutation.mutateAsync({ presignedUrl, file });
    setUploadedImageUrl(uploadUrl);
    onUploadSuccess?.(uploadUrl);
  }

  // 웹용 파일 핸들러
  async function handleWebFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        throw new Error("INVALID_FORMAT");
      }
      onUpload?.();
      const readerURL = URL.createObjectURL(file);
      setCropTarget(readerURL); // 바로 업로드하지 않고 크롭 타겟으로 설정
    } catch (err) {
      onUploadError?.(err);
    } finally {
      e.target.value = "";
    }
  }

  // 네이티브용 핸들러
  async function handleNativeUpload(source: "camera" | "gallery") {
    try {
      let image: any;

      if (source === "camera") {
        image = await Camera.takePhoto({
          quality: 90,
        });
      } else if (source === "gallery") {
        const { results } = await Camera.chooseFromGallery({
          quality: 90,
          limit: 1,
        });
        image = results[0];
      }

      if (!image) return;

      onUpload?.();
      setCropTarget(image.webPath); // 크롭 타겟으로 설정
    } catch (err) {
      clearImage();
      onUploadError?.(err);
    }
  }

  const isUploading =
    isCropping ||
    getPresignedUrlMutation.isPending ||
    uploadToS3Mutation.isPending;

  function clearImage() {
    setTempImageUrl(undefined);
    setUploadedImageUrl("");
  }

  // 메모리 누수 방지
  useEffect(() => {
    return () => {
      if (tempImageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(tempImageUrl);
      }
    };
  }, [tempImageUrl]);

  return {
    tempImageUrl,
    uploadedImageUrl,
    isUploading,
    cropTarget,
    setCropTarget,
    handleCropComplete,
    clearImage,
    handleWebFileChange,
    handleNativeUpload,
  };
}
