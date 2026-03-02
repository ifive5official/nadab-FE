import type { ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { api } from "@/lib/axios";
import { infiniteQueryOptions } from "@tanstack/react-query";

type NotificationsRes = components["schemas"]["NotificationListResponse"];

export const notificationsOptions = infiniteQueryOptions({
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
