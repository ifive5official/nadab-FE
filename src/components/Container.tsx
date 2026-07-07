/**
 * @description 양옆과 하단 패딩이 있는 디폴트 레이아웃
 */

import clsx from "clsx";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  hasScroll?: boolean; // 스크롤이 필요한 페이지인가?
  hasBottomPadding?: boolean; // 하단 패딩이 필요한 페이지인가?
} & ComponentPropsWithoutRef<"main">;

const Container = forwardRef<HTMLElement, Props>(function Container(
  {
    children,
    className,
    hasScroll = false,
    hasBottomPadding = true,
    ...props
  },
  ref,
) {
  return (
    <main
      ref={ref}
      className={clsx(
        "flex-1 w-full flex flex-col px-padding-x-m",
        className,
        !hasScroll &&
          "overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        hasBottomPadding && "pb-padding-y-m",
      )}
      {...props}
    >
      {children}
    </main>
  );
});

export default Container;
