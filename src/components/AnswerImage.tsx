// 답변에 쓰이는 이미지

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
