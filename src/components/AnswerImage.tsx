/**
 * @description 답변 이미지 컴포넌트
 * @props 이미지 url을 전달받음
 * @page 피드 및 상세보기 페이지에서 사용
 */
import { useState } from "react";

type Props = {
  imageUrl: string;
};

export default function AnswerImage({ imageUrl }: Props) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  return (
    <div className="w-full rounded-xl overflow-hidden aspect-square">
      {isImageLoading && (
        <div className="w-full aspect-square bg-neutral-300 animate-pulse" />
      )}
      <img
        className="w-full aspect-square object-cover"
        src={imageUrl}
        loading="lazy"
        alt="답변 이미지"
        onLoad={() => setIsImageLoading(false)}
      />
    </div>
  );
}
