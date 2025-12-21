// 마이페이지 상단 프로필 섹션
import type { CurrentUser } from "@/types/currentUser";
import BlockButton from "@/components/BlockButton";
import { Link } from "@tanstack/react-router";

type Props = {
  currentUser: CurrentUser;
};

export default function ProfileSection({ currentUser }: Props) {
  return (
    <div className="py-padding-y-m flex flex-col gap-gap-y-l">
      <div className="flex items-center gap-gap-x-l">
        <img
          src={currentUser?.profileImageUrl ?? "/default-profile.png"}
          className="rounded-full aspect-square h-[53px] object-cover"
        ></img>
        <div className="flex flex-col gap-y-xs">
          <p className="text-text-primary text-title-3">
            {currentUser?.nickname}
          </p>
          <p className="text-neutral-600 text-caption-l">
            {currentUser?.email}
          </p>
        </div>
      </div>
      <Link to="/account/profile">
        <BlockButton
          variant="tertiary"
          className="py-padding-y-s text-button-2"
        >
          프로필 수정
        </BlockButton>
      </Link>
    </div>
  );
}
