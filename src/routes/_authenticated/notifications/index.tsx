import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { ChevronRightIcon } from "@/components/Icons";
import type { ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { api } from "@/lib/axios";
import { formatRelativeDate } from "@/lib/formatDate";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  type LinkProps,
  type RegisteredRouter,
} from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";

type NotificationsRes = components["schemas"]["NotificationListResponse"];
type Notification = components["schemas"]["NotificationResponse"];

const notificationsOptions = infiniteQueryOptions({
  queryKey: ["currentUser", "notifications"],
  queryFn: async ({ pageParam }) => {
    const req = {
      cursor: pageParam || undefined,
    };
    const res = await api.get<ApiResponse<NotificationsRes>>(
      "/api/v1/notifications",
      {
        params: req,
      },
    );

    return res.data.data!;
  },
  initialPageParam: null as number | null,
  getNextPageParam: (lastPage) =>
    lastPage.hasNext ? lastPage.nextCursor : null,
});

export const Route = createFileRoute("/_authenticated/notifications/")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureInfiniteQueryData(notificationsOptions);
  },
});

function RouteComponent() {
  const { ref, inView } = useInView();
  const {
    data: notificationsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(notificationsOptions);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const groupedNotifications = useMemo(() => {
    const allNotifications =
      notificationsData?.pages.flatMap((page) => page.notifications) ?? [];

    const groups: Record<"today" | "thisWeek" | "older", Notification[]> = {
      today: [],
      thisWeek: [],
      older: [],
    };

    allNotifications.forEach((notification) => {
      const now = new Date();
      const date = new Date(notification!.createdAt!);
      const diffInDays = (Number(now) - Number(date)) / (1000 * 60 * 60 * 24);

      const isShown =
        notification?.type !== "DAILY_WRITE_REMINDER" &&
        notification?.type !== "INACTIVE_USER_REMINDER";

      if (isShown && diffInDays <= 1) {
        groups.today.push(notification!);
      } else if (isShown && diffInDays <= 7) {
        groups.thisWeek.push(notification!);
      } else if (isShown) {
        groups.older.push(notification!);
      }
    });

    return groups;
  }, [notificationsData]);

  return (
    <>
      <SubHeader>알림</SubHeader>
      <Container>
        <div className="text-label-m py-2.5">최근</div>
        <ul>
          {groupedNotifications.today?.map((notification) => (
            <NotificationItem
              key={notification!.id}
              notification={notification!}
            />
          ))}
        </ul>
        {groupedNotifications.thisWeek.length > 0 && (
          <>
            <div className="border-b border-b-interactive-border-default -mx-padding-x-m" />
            <div className="text-label-m py-2.5">이번 주</div>
            <ul>
              {groupedNotifications.thisWeek?.map((notification) => (
                <NotificationItem
                  key={notification!.id}
                  notification={notification!}
                />
              ))}
            </ul>
          </>
        )}
        {groupedNotifications.older.length > 0 && (
          <>
            <div className="border-b border-b-interactive-border-default -mx-padding-x-m" />
            <div className="text-label-m py-2.5">오래 전</div>
            <ul>
              {groupedNotifications.older?.map((notification) => (
                <NotificationItem
                  key={notification!.id}
                  notification={notification!}
                />
              ))}
            </ul>
          </>
        )}
        {isFetchingNextPage && <NotificationItemsSkeleton />}
        <div ref={ref} />
      </Container>
    </>
  );
}

const NOTIFICATION_CONFIG: Record<
  NonNullable<Notification["type"]>,
  {
    imgSrc: string;
    title?: string;
    body?: string;
    linkProps: LinkProps<RegisteredRouter["routeTree"]>;
  }
> = {
  WEEKLY_REPORT_COMPLETED: {
    imgSrc: "/icon/report-complete.png",
    title: "리포트 완성",
    body: "주간 리포트가 완성됐어요.",
    linkProps: {
      to: "/report",
      search: { tab: "periodic" },
    },
  },
  MONTHLY_REPORT_COMPLETED: {
    imgSrc: "/icon/report-complete.png",
    title: "리포트 완성",
    body: "월간 리포트가 완성됐어요.",
    linkProps: {
      to: "/report",
      search: { tab: "periodic" },
    },
  },
  TYPE_REPORT_COMPLETED: {
    imgSrc: "/icon/report-complete.png",
    title: "리포트 완성",
    body: "유형 리포트가 완성됐어요.",
    linkProps: {
      to: "/report",
      search: { tab: "type" },
    },
  },
  WEEKLY_REPORT_AVAILABLE: {
    imgSrc: "/icon/report-complete.png",
    title: "리포트 조건 충족",
    body: "주간 리포트를 만들 수 있어요.",
    linkProps: {
      to: "/report",
      search: { tab: "periodic" },
    },
  },
  MONTHLY_REPORT_AVAILABLE: {
    imgSrc: "/icon/report-complete.png",
    title: "리포트 조건 충족",
    body: "월간 리포트를 만들 수 있어요.",
    linkProps: {
      to: "/report",
      search: { tab: "periodic" },
    },
  },
  TYPE_REPORT_AVAILABLE: {
    imgSrc: "/icon/report-complete.png",
    title: "리포트 조건 충족",
    body: "유형 리포트를 만들 수 있어요.",
    linkProps: {
      to: "/report",
      search: { tab: "type" },
    },
  },
  FRIEND_REQUEST_RECEIVED: {
    imgSrc: "/icon/friend-request.png",
    title: "친구 요청",
    linkProps: {
      to: "/social/requests",
    },
  },
  FRIEND_REQUEST_ACCEPTED: {
    imgSrc: "/icon/friend-accept.png",
    title: "친구 수락",
    linkProps: {
      to: "/social",
      search: { tab: "friends" },
    },
  },
  DAILY_WRITE_REMINDER: {
    imgSrc: "string",
    linkProps: {
      to: "/",
    },
  },
  INACTIVE_USER_REMINDER: {
    imgSrc: "string",
    linkProps: {
      to: "/",
    },
  },
};

function NotificationItem({ notification }: { notification: Notification }) {
  const config = NOTIFICATION_CONFIG[notification.type!];
  return (
    <Link {...config.linkProps}>
      <li className="flex items-center gap-gap-x-l py-padding-y-xs">
        <img
          src={config.imgSrc}
          alt="알림 아이콘"
          className="aspect-square h-13"
        />
        <div className="flex flex-col">
          <p className="text-label-m">{config.title ?? notification.title}</p>
          <p className="text-caption-m">{config.body ?? notification.body}</p>
          <p className="text-caption-m text-text-tertiary">
            {formatRelativeDate(notification.createdAt!)}
          </p>
        </div>
        <div className="flex items-center gap-gap-x-xs text-icon-muted ml-auto">
          {!notification.isRead && (
            <div className="aspect-square h-1.5 bg-brand-primary rounded-full" />
          )}

          <ChevronRightIcon />
        </div>
      </li>
    </Link>
  );
}

function NotificationItemsSkeleton() {
  return (
    <>
      {Array(10)
        .fill(0)
        .map((_, i) => (
          <li key={i} className="list-none">
            <div className="flex items-center gap-gap-x-l py-padding-y-xs">
              <div className="bg-surface-layer-2 animate-pulse aspect-square rounded-full h-13" />
              <div className="flex flex-col">
                <p className="text-label-m bg-surface-layer-2 animate-pulse w-20 rounded-sm">
                  ㅤ
                </p>
                <p className="text-caption-m bg-surface-layer-2 animate-pulse w-40 rounded-sm">
                  ㅤ
                </p>
                <p className="text-caption-m text-text-tertiary bg-surface-layer-2 animate-pulse w-10 rounded-sm">
                  ㅤ
                </p>
              </div>
              {/* <div className="flex items-center gap-gap-x-xs text-icon-muted ml-auto">
                <ChevronRightIcon />
              </div> */}
            </div>
          </li>
        ))}
    </>
  );
}
