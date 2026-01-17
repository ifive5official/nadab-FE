import { queryOptions } from "@tanstack/react-query";
import type { ApiResponse } from "@/generated/api";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";
import { formatISODate } from "@/lib/formatDate";
import { REPORT_CONFIGS } from "./reportConfigs";

type ReportRes = components["schemas"]["DailyReportResponse"];

export const reportOptions = queryOptions({
  queryKey: ["currentUser", "report", formatISODate(new Date())],
  queryFn: async () => {
    const res = await api.get<ApiResponse<ReportRes>>("/api/v1/daily-report");
    return res.data.data!;
  },
});

type weeklyReportsRes = components["schemas"]["MyWeeklyReportResponse"];
type monthlyReportRes = components["schemas"]["MyMonthlyReportResponse"];

type ReportTypeMap = {
  weekly: weeklyReportsRes;
  monthly: monthlyReportRes;
};

export const periodicReportOptions = <T extends keyof ReportTypeMap>(
  type: T
) => {
  const config = REPORT_CONFIGS[type];

  return queryOptions({
    queryKey: ["currentUser", config.key] as const,
    queryFn: async () => {
      const res = await api.get<ApiResponse<ReportTypeMap[T]>>(
        `/api/v1/${config.key}`
      );
      return res.data.data!;
    },
  });
};
