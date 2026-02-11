import clsx from "clsx";

// 양옆과 하단 패딩이 있는 디폴트 레이아웃
type Props = {
  children: React.ReactNode;
  className?: string;
  isMain?: boolean;
};

export default function Container({
  children,
  className,
  isMain = false,
}: Props) {
  return (
    <main
      className={clsx(
        "flex-1 w-full flex flex-col px-padding-x-m pb-padding-y-m",
        className,
        !isMain &&
          "overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      )}
    >
      {children}
    </main>
  );
}
