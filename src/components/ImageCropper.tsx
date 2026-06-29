/**
 * @description 화면 전체를 차지하는 이미지 크롭 컴포넌트
 * @page 프로필 및 답변 이미지 업로드 시 사용
 */
import { useState } from "react";
import Cropper from "react-easy-crop";

type Props = {
  image: string;
  onConfirm: (pixels: any) => void;
  onCancel: () => void;
};

export function ImageCropper({ image, onConfirm, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleConfirm = async () => {
    onConfirm(croppedAreaPixels);
  };

  return (
    <div className="fixed inset-0 sm:w-[412px] sm:mx-auto z-9999 flex flex-col bg-black pt-padding-y-m pb-[calc(var(--spacing-padding-y-m)+var(--safe-bottom))]">
      <div className="relative w-full flex-1">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1} // 정사각형 고정
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
        />
      </div>
      <div className="flex py-padding-y-m text-white">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 text-label-l"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 text-label-l"
        >
          확인
        </button>
      </div>
    </div>
  );
}
