// 친구 관리 섹션 아이템

import { ChevronRightIcon } from "@/components/Icons";
import ProfileImg from "@/components/ProfileImg";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";

type Props = {
  to: string;
  title: string;
  profileImgUrl: string[];
  shownNickname: string;
  totalCount: number;
  hasNotification?: boolean;
};

export default function FriendManagementItem({
  to,
  title,
  profileImgUrl,
  shownNickname,
  totalCount,
  hasNotification,
}: Props) {
  return (
    <Link to={to}>
      <div className="py-padding-y-m flex items-center">
        <div className="flex mr-margin-x-l">
          <ProfileImg
            width={profileImgUrl.length >= 2 ? 36 : 50}
            src={profileImgUrl[0]}
            className={clsx(profileImgUrl.length >= 2 && "-mt-4")}
          />
          {profileImgUrl.length === 2 && (
            <ProfileImg
              width={36}
              src={profileImgUrl[1]}
              className="-ml-5 -mb-4"
            />
          )}
          {profileImgUrl.length > 2 && (
            <div className="rounded-full aspect-square h-9 -ml-5 -mb-4 flex items-center justify-center text-label-s bg-button-primary-bg-default border border-interactive-border-default dark:border-0 text-text-inverse-primary">
              +{profileImgUrl.length - 1}
            </div>
          )}
        </div>
        <div className="flex flex-col mr-auto">
          <span className="text-label-m">{title}</span>
          <span className="text-caption-s text-text-tertiary">
            {shownNickname}님 {totalCount > 1 && `외 ${totalCount - 1}명`}
          </span>
        </div>
        {hasNotification && (
          <div className="bg-brand-primary aspect-square m-[8.5px] h-2 rounded-full" />
        )}
        <button>
          <ChevronRightIcon size={28} />
        </button>
      </div>
    </Link>
  );
}
