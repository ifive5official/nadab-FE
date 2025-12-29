// 메인 헤더 밑에 있는 네비게이션
import { Link } from "@tanstack/react-router";
import clsx from "clsx";

const TAB_ITEMS = [
  { to: "/", label: "홈" },
  { to: "/social", label: "소셜" },
  { to: "/report", label: "리포트" },
  { to: "/calendar", label: "캘린더" },
] as const;

export default function Tabs() {
  return (
    // 헤더 높이 띄움
    <nav className="mt-header-height flex gap-margin-x-xl px-padding-x-m border-b border-b-border-base">
      {TAB_ITEMS.map((item) => {
        return (
          <Link key={item.to} to={item.to} className="flex-1 text-center">
            {({ isActive }) => {
              return (
                <li
                  className={clsx(
                    "list-none py-padding-y-m text-label-l",
                    isActive
                      ? "text-interactive-text-default border-b-2 border-b-text-primary"
                      : "text-interactive-text-mute"
                  )}
                >
                  {item.label}
                </li>
              );
            }}
          </Link>
        );
      })}
    </nav>
  );
}
