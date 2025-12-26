import clsx from "clsx";

type SectionProps = {
  title: string;
  children?: React.ReactNode;
};

export function Section({ title, children }: SectionProps) {
  return (
    <li className="py-padding-y-xs px-padding-x-m">
      <div className="flex items-center">
        <p className="text-title-3 py-padding-y-xs mr-auto">{title}</p>
      </div>
      {children}
    </li>
  );
}

type SectionItemProps = {
  title: string;
  rightElement?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

export function SectionItem({
  title,
  rightElement,
  onClick,
  disabled,
}: SectionItemProps) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={clsx(
        "py-padding-y-xs flex justify-between items-center cursor-pointer",
        disabled && "text-text-disabled cursor-default!"
      )}
    >
      <p className="text-caption-l">{title}</p>
      {rightElement}
    </div>
  );
}

export function SectionDivider() {
  return (
    <div className="border-b border-interactive-border-default my-gap-y-s" />
  );
}
