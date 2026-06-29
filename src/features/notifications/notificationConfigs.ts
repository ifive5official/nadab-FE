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
    inboxIconSrc: "/icon/social.png",
    inboxTitle: "피드 알림",
    // 서버에서 오늘 피드의 댓글만 알림으로 보내므로 피드 탭으로 이동한다.
    // 이전 날짜 피드 알림을 지원하게 되면 /detail/$date/$postId/comments 경로를 사용해야 한다.
    getLinkProps: (notification) => ({
      to: "/social/$postId/comments",
      params: {
        postId: String(notification.targetId),
      },
    }),
  },
  REPLY_ON_MY_COMMENT: {
    inboxIconSrc: "/icon/social.png",
    inboxTitle: "피드 알림",
    getLinkProps: (notification) => ({
      to: "/social/$postId/comments",
      params: {
        postId: String(notification.targetId),
      },
    }),
  },
  REPLY_ON_PARTICIPATED_COMMENT: {
    inboxIconSrc: "/icon/social.png",
    inboxTitle: "피드 알림",
    getLinkProps: (notification) => ({
      to: "/social/$postId/comments",
      params: {
        postId: String(notification.targetId),
      },
    }),
  },
};
