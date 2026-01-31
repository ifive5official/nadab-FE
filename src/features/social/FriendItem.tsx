import ProfileImg from "@/components/ProfileImg";

type Props = {
  profileImgUrl: string;
  name: string;
  buttons: React.ReactNode[];
  onClick?: () => void;
};

export default function FriendItem({
  profileImgUrl,
  name,
  buttons,
  onClick,
}: Props) {
  return (
    <li className="w-full flex items-center gap-margin-x-l" onClick={onClick}>
      <ProfileImg width={50} src={profileImgUrl} />
      <span className="text-button-1 mr-auto">{name}</span>
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
