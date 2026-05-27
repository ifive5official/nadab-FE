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

type UploadUrlRes = components["schemas"]["CreateAnswerImageUploadUrlResponse"];
type StatusRes = components["schemas"]["ImageStatusResponse"];

type ImageUploaderProps = {
  apiUrl: string;
  initialImageUrl?: string;
  onUpload?: () => void; // 이미지 선택 직후 동작(모달 닫는 등)
  onCropSuccess?: () => void;
  onUploadSuccess?: () => void;

  onUploadError?: (error: any) => void;
};

export function useImageUploader({
  apiUrl,
  initialImageUrl,
  onUpload,
  onCropSuccess,
  onUploadSuccess,
  onUploadError,
}: ImageUploaderProps) {
  const [cropTarget, setCropTarget] = useState<string | null>(null); // 크롭 전 선택된 이미지
  const [croppedFile, setCroppedFile] = useState<File | null>(null); // 크롭된 파일 객체
  const [tempImageUrl, setTempImageUrl] = useState(initialImageUrl); // 서버 업로드 전 사용자에게 보여줄 임시 이미지

  const [isCropping, setIsCropping] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // WebP 상태 조회를 위한 폴링 함수
  async function pollWebpStatus(key: string) {
    const MAX_RETRY_TIME = 7000; // 7초
    const INTERVAL = 500; // 1초 간격
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_RETRY_TIME) {
      try {
        const res = await api.get<ApiResponse<StatusRes>>(
          "/api/v1/daily-report/image/status",
          { params: { key } },
        );

        if (res.data?.data?.status === "READY") {
          return true;
        }
      } catch (err) {
        console.error("WebP status check failed", err);
      }
      // 1초 대기
      await new Promise((resolve) => setTimeout(resolve, INTERVAL));
    }
    return false; // 7초 초과
  }

  // 크롭 완료 후 호출 - 크롭된 이미지 임시저장
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
      setCroppedFile(file);
      onCropSuccess?.();
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

  // 서버에 업로드할 때 호출하는 함수
  async function uploadImage() {
    if (!croppedFile) return;
    try {
      const res = await getPresignedUrlMutation.mutateAsync(croppedFile.type);
      const data = res.data;

      let presignedUrl = "";
      let objectKey = "";

      // 예외처리
      if (apiUrl.includes("/user/me/profile-image/upload-url")) {
        presignedUrl = data?.objectKey ?? "";
        objectKey = data?.uploadUrl ?? "";
      } else {
        presignedUrl = data?.uploadUrl ?? "";
        objectKey = data?.objectKey ?? "";
      }

      await uploadToS3Mutation.mutateAsync({ presignedUrl, file: croppedFile });
      if (apiUrl.includes("daily-report/image/upload-url") && data?.webpKey) {
        setIsPolling(true);
        const isReady = await pollWebpStatus(data?.webpKey);
        setIsPolling(false);

        if (!isReady) {
          throw new Error("WEBP_CONVERSION_TIMEOUT"); // 7초 경과 시 에러 발생
        }
      }

      onUploadSuccess?.();

      return { objectKey, webpKey: data?.webpKey };
    } catch (err) {
      onUploadError?.(err);
      throw err;
    }
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
    getPresignedUrlMutation.isPending ||
    uploadToS3Mutation.isPending ||
    isPolling;

  function clearImage() {
    setTempImageUrl(undefined);
    setCroppedFile(null);
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
    isCropping,
    isUploading,
    cropTarget,
    setCropTarget,
    handleCropComplete,
    uploadImage,
    clearImage,
    handleWebFileChange,
    handleNativeUpload,
  };
}
