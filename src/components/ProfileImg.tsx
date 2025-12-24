// 프로필 이미지 컴포넌트
// 기본 디폴트 이미지 + 로드 시에 스켈레톤 보여주려고 따로 뺌
import { defaultProfileImgUrl } from "@/constants/defaultprofileImgUrl";

export default function ProfileImg({
  width,
  src,
}: {
  width: number;
  src: string | undefined;
}) {
  return (
    <img
      style={{ width }}
      src={src ?? defaultProfileImgUrl}
      className="aspect-square rounded-full object-cover bg-neutral-300"
    />
  );
}
