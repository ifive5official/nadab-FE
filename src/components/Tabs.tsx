/**
 * @description 메인 헤더 밑에 있는 네비게이션
 * @page 메인 4개 페이지(홈, 리포트, 소셜, 캘린더) 에서 사용
 * @note 스크롤 시 헤더 아래로 들어가도록 되어 있음
 */

import { Link } from "@tanstack/react-router";
import clsx from "clsx";

const TAB_ITEMS = [
  { to: "/", label: "홈" },
  {
    to: "/report",
    label: "리포트",
    coachmark: "home-report-tab",
  },
  {
    to: "/social",
    label: "소셜",
    coachmark: "home-social-tab",
  },
  {
    to: "/calendar",
    label: "캘린더",
    coachmark: "home-calendar-tab",
  },
] as const;

export default function Tabs() {
  return (
    // 헤더 높이만큼 띄움
    <nav className="flex gap-margin-x-xl px-padding-x-m border-b border-b-border-base">
      {TAB_ITEMS.map((item) => {
        const coachmark = "coachmark" in item ? item.coachmark : undefined;

        return (
          <Link
            key={item.to}
            to={item.to}
            data-coachmark={coachmark}
            className="flex-1 rounded-lg text-center"
          >
            {({ isActive }) => {
              return (
                <li
                  className={clsx(
                    "list-none py-padding-y-m text-label-l",
                    isActive
                      ? "text-interactive-text-default border-b-2 border-b-text-primary"
                      : "text-interactive-text-mute",
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
