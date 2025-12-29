import clsx from "clsx";

// 양옆과 하단 패딩이 있는 디폴트 레이아웃
type Props = {
  children: React.ReactNode;
  className?: string;
  hasHeader?: boolean;
};

// Todo: 홈에서 hasHeader를 false처리해야 하는데
//  헤더 처리 더 좋은 방법 없을까

export default function Container({
  children,
  className,
  hasHeader = true,
}: Props) {
  return (
    <main
      className={clsx(
        "h-full w-full flex flex-col px-padding-x-m pb-padding-y-m",
        className,
        hasHeader && "mt-header-height"
      )}
    >
      {children}
    </main>
  );
}
