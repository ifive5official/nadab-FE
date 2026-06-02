/**
 * @description 양옆과 하단 패딩이 있는 디폴트 레이아웃
 */

import clsx from "clsx";

type Props = {
  children: React.ReactNode;
  className?: string;
  hasScroll?: boolean; // 스크롤이 필요한 페이지인가?
};

export default function Container({
  children,
  className,
  hasScroll = false,
}: Props) {
  return (
    <main
      className={clsx(
        "flex-1 w-full flex flex-col px-padding-x-m pb-padding-y-m",
        className,
        !hasScroll &&
          "overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      )}
    >
      {children}
    </main>
  );
}
