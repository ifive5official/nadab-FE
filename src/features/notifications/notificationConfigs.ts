import type { components } from "@/generated/api-types";
import { type LinkProps, type RegisteredRouter } from "@tanstack/react-router";

export type Notification = components["schemas"]["NotificationResponse"];

export const NOTIFICATION_CONFIG: Record<
  NonNullable<Notification["type"]>,
  {
    inboxIconSrc: string;
    inboxTitle?: string;
    linkProps: LinkProps<RegisteredRouter["routeTree"]>;
  }
> = {
  WEEKLY_REPORT_COMPLETED: {
    inboxIconSrc: "/icon/weekly-report.png",
    inboxTitle: "주간 리포트 완성",
    linkProps: {
      to: "/report",
      search: { tab: "periodic" },
    },
  },
  MONTHLY_REPORT_COMPLETED: {
    inboxIconSrc: "/icon/monthly-report.png",
    inboxTitle: "월간 리포트 완성",
    linkProps: {
      to: "/report",
      search: { tab: "periodic" },
    },
  },
  TYPE_REPORT_COMPLETED: {
    inboxIconSrc: "/icon/type-report.png",
    inboxTitle: "유형 리포트 완성",
    linkProps: {
      to: "/report",
      search: { tab: "type" },
    },
  },
  WEEKLY_REPORT_AVAILABLE: {
    inboxIconSrc: "/icon/weekly-report.png",
    inboxTitle: "주간 리포트 조건 충족",
    linkProps: {
      to: "/report",
      search: { tab: "periodic" },
    },
  },
  MONTHLY_REPORT_AVAILABLE: {
    inboxIconSrc: "/icon/monthly-report.png",
    inboxTitle: "월간 리포트 조건 충족",
    linkProps: {
      to: "/report",
      search: { tab: "periodic" },
    },
  },
  TYPE_REPORT_AVAILABLE: {
    inboxIconSrc: "/icon/type-report.png",
    inboxTitle: "유형 리포트 조건 충족",
    linkProps: {
      to: "/report",
      search: { tab: "type" },
    },
  },
  FRIEND_REQUEST_RECEIVED: {
    inboxIconSrc: "/icon/friend-request.png",
    inboxTitle: "친구 요청",
    linkProps: {
      to: "/social/requests",
    },
  },
  FRIEND_REQUEST_ACCEPTED: {
    inboxIconSrc: "/icon/friend-accept.png",
    inboxTitle: "친구 수락",
    linkProps: {
      to: "/social",
      search: { tab: "friends" },
    },
  },
  DAILY_WRITE_REMINDER: {
    inboxIconSrc: "/icon/write.png",
    linkProps: {
      to: "/",
    },
  },
  INACTIVE_USER_REMINDER: {
    inboxIconSrc: "/icon/write.png",
    linkProps: {
      to: "/",
    },
  },
};
