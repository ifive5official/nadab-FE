import ProfileImg from "@/components/ProfileImg";
import clsx from "clsx";

type Props = {
  profileImgUrl: string;
  name: string;
  buttons: React.ReactNode[];
  isWithdrawn?: boolean;
  onClick?: () => void;
};

export default function FriendItem({
  profileImgUrl,
  name,
  buttons,
  isWithdrawn = false,
  onClick,
}: Props) {
  return (
    <li className="w-full flex items-center gap-margin-x-l" onClick={onClick}>
      <ProfileImg
        width={50}
        src={profileImgUrl}
        className={clsx(isWithdrawn && "opacity-30")}
      />
      <div className="flex flex-col mr-auto">
        <span
          className={clsx(
            "text-button-1 mr-auto",
            isWithdrawn && "text-text-tertiary",
          )}
        >
          {name}
        </span>
        {isWithdrawn && (
          <span className="text-caption-s text-text-disabled">
            탈퇴 예정인 친구
          </span>
        )}
      </div>

      <div className="flex gap-gap-x-s">{buttons}</div>
    </li>
  );
}

export function FriendItemSkeleton() {
  return (
    <li className="flex items-center gap-margin-x-l">
      <div className="rounded-full aspect-square h-[50px] bg-surface-layer-2 animate-pulse" />
      <div className="text-button-1 h-6 w-15 rounded-md mr-auto bg-surface-layer-2 animate-pulse" />
    </li>
  );
}
