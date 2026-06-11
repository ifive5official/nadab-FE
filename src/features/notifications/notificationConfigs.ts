import type { components } from "@/generated/api-types";
import { type LinkProps, type RegisteredRouter } from "@tanstack/react-router";

export type Notification = components["schemas"]["NotificationResponse"];

export const NOTIFICATION_CONFIG: Record<
  NonNullable<Notification["type"]>,
  {
    inboxIconSrc: string;
    inboxTitle?: string;
    getLinkProps: (
      notification: Notification,
    ) => LinkProps<RegisteredRouter["routeTree"]>;
  }
> = {
  WEEKLY_REPORT_COMPLETED: {
    inboxIconSrc: "/icon/weekly-report.png",
    inboxTitle: "주간 리포트 완성",
    getLinkProps: () => ({
      to: "/report",
      search: { tab: "periodic" },
    }),
  },
  MONTHLY_REPORT_COMPLETED: {
    inboxIconSrc: "/icon/monthly-report.png",
    inboxTitle: "월간 리포트 완성",
    getLinkProps: () => ({
      to: "/report",
      search: { tab: "periodic" },
    }),
  },
  TYPE_REPORT_COMPLETED: {
    inboxIconSrc: "/icon/type-report.png",
    inboxTitle: "유형 리포트 완성",
    getLinkProps: () => ({
      to: "/report",
      search: { tab: "type" },
    }),
  },
  WEEKLY_REPORT_AVAILABLE: {
    inboxIconSrc: "/icon/weekly-report.png",
    inboxTitle: "주간 리포트 조건 충족",
    getLinkProps: () => ({
      to: "/report",
      search: { tab: "periodic" },
    }),
  },
  MONTHLY_REPORT_AVAILABLE: {
    inboxIconSrc: "/icon/monthly-report.png",
    inboxTitle: "월간 리포트 조건 충족",
    getLinkProps: () => ({
      to: "/report",
      search: { tab: "periodic" },
    }),
  },
  TYPE_REPORT_AVAILABLE: {
    inboxIconSrc: "/icon/type-report.png",
    inboxTitle: "유형 리포트 조건 충족",
    getLinkProps: () => ({
      to: "/report",
      search: { tab: "type" },
    }),
  },
  FRIEND_REQUEST_RECEIVED: {
    inboxIconSrc: "/icon/friend-request.png",
    inboxTitle: "친구 요청",
    getLinkProps: () => ({
      to: "/social/requests",
    }),
  },
  FRIEND_REQUEST_ACCEPTED: {
    inboxIconSrc: "/icon/friend-accept.png",
    inboxTitle: "친구 수락",
    getLinkProps: () => ({
      to: "/social",
      search: { tab: "friends" },
    }),
  },
  DAILY_WRITE_REMINDER: {
    inboxIconSrc: "/icon/write.png",
    getLinkProps: () => ({
      to: "/",
    }),
  },
  INACTIVE_USER_REMINDER: {
    inboxIconSrc: "/icon/write.png",
    getLinkProps: () => ({
      to: "/",
    }),
  },
  COMMENT_ON_MY_REPORT: {
    inboxIconSrc: "/icon/social.png", // 변경
    inboxTitle: "피드 알림",
    getLinkProps: (notification) => ({
      to: "/social/$postId/comments",
      params: {
        postId: String(notification.targetId),
      },
    }),
  },
  REPLY_ON_MY_COMMENT: {
    inboxIconSrc: "/icon/social.png", // 변경
    inboxTitle: "피드 알림",
    getLinkProps: (notification) => ({
      to: "/social/$postId/comments",
      params: {
        postId: String(notification.targetId),
      },
    }),
  },
  REPLY_ON_PARTICIPATED_COMMENT: {
    inboxIconSrc: "/icon/social.png", // 변경
    inboxTitle: "피드 알림",
    getLinkProps: (notification) => ({
      to: "/social/$postId/comments",
      params: {
        postId: String(notification.targetId),
      },
    }),
  },
  COMMENT_ON_MY_REPORT: {
    inboxIconSrc: "/icon/social.png",
    inboxTitle: "내 리포트에 댓글",
    linkProps: {
      to: "/social",
    },
  },
  REPLY_ON_MY_COMMENT: {
    inboxIconSrc: "/icon/social.png",
    inboxTitle: "내 댓글에 답글",
    linkProps: {
      to: "/social",
    },
  },
  REPLY_ON_PARTICIPATED_COMMENT: {
    inboxIconSrc: "/icon/social.png",
    inboxTitle: "참여한 댓글에 답글",
    linkProps: {
      to: "/social",
    },
  },
};
