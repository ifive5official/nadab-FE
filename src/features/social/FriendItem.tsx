type Props = {
  profileImgUrl: string;
  name: string;
  buttons: React.ReactNode[];
};

export default function FriendItem({ name, buttons }: Props) {
  return (
    <li className="flex items-center gap-margin-x-l">
      <div className="rounded-full aspect-square h-[50px] bg-neutral-300" />
      <span className="text-button-1 mr-auto">{name}</span>
      <div className="flex gap-gap-x-s">{buttons}</div>
    </li>
  );
}
