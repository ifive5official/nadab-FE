import { queryOptions } from "@tanstack/react-query";
import type { ApiResponse } from "@/generated/api";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";

type RecentsRes = components["schemas"]["CalendarRecentsResponse"];

export const recentOptions = queryOptions({
  queryKey: ["currentUser", "recent"],
  queryFn: async () => {
    const res = await api.get<ApiResponse<RecentsRes>>(
      "/api/v1/answers/calendar/recents",
    );
    return res.data.data!;
  },
});
