import { queryOptions } from "@tanstack/react-query";
import type { ApiResponse } from "@/generated/api";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";

type ReportRes = components["schemas"]["DailyReportResponse"];

export const reportOptions = queryOptions({
  queryKey: [
    "currentUser",
    "report",
    new Date().toLocaleDateString("sv-SE", {
      timeZone: "Asia/Seoul",
    }),
  ],
  queryFn: async () => {
    const res = await api.get<ApiResponse<ReportRes>>("/api/v1/daily-report");
    return res.data.data!;
  },
});
