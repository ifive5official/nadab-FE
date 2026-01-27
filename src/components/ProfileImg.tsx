// 프로필 이미지 컴포넌트
// 기본 디폴트 이미지 + 로드 시에 스켈레톤 보여주려고 따로 뺌
import { defaultProfileImgUrl } from "@/constants/defaultprofileImgUrl";
import clsx from "clsx";

export default function ProfileImg({
  width,
  src,
  className,
}: {
  width: number;
  src: string | undefined;
  className?: string;
}) {
  return (
    <img
      style={{ width }}
      src={src || defaultProfileImgUrl}
      className={clsx(
        "aspect-square rounded-full object-cover bg-neutral-300",
        className,
      )}
    />
  );
}
