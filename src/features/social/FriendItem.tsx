import InlineButton from "@/components/InlineButton";

type Props = {
  profileImgUrl: string;
  name: string;
  buttons: Button[];
};

type Button = {
  label: string;
  disabled?: boolean;
  onClick: () => void;
};

export default function FriendItem({ name, buttons }: Props) {
  return (
    <li className="flex items-center gap-margin-x-l">
      <div className="rounded-full aspect-square h-[50px] bg-neutral-300" />
      <span className="text-button-1 mr-auto">{name}</span>
      <div className="flex gap-gap-x-s">
        <InlineButton variant="secondary" onClick={buttons[0].onClick}>
          {buttons[0].label}
        </InlineButton>

        {buttons.length === 2 && (
          <InlineButton onClick={buttons[1].onClick}>
            {buttons[1].label}
          </InlineButton>
        )}
      </div>
    </li>
  );
}
