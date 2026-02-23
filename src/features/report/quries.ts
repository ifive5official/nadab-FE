import { queryOptions } from "@tanstack/react-query";
import type { ApiResponse } from "@/generated/api";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";
import { REPORT_CONFIGS } from "./reportConfigs";

type ReportRes = components["schemas"]["DailyReportResponse"];

// 아이디로 일간 리포트 조회
export const dailyReportOptions = (reportId: number) =>
  queryOptions({
    queryKey: ["currentUser", "report", reportId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ReportRes>>(
        `/api/v1/daily-report/${reportId}`,
      );
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
  type: T,
) => {
  const config = REPORT_CONFIGS[type];

  return queryOptions({
    queryKey: ["currentUser", config.key] as const,
    queryFn: async () => {
      const res = await api.get<ApiResponse<ReportTypeMap[T]>>(
        `/api/v1/${config.key}`,
      );
      return res.data.data!;
    },
  });
};

type TypeReportRes = components["schemas"]["MyAllTypeReportsResponse"];

// 유형 레포트 전체 가져오기
export const typeReportOptions = queryOptions({
  queryKey: ["currentUser", "type-report"],
  queryFn: async () => {
    const res = await api.get<ApiResponse<TypeReportRes>>(
      "/api/v1/type-report",
    );
    return res.data.data!;
  },
});

type AnswerRes = components["schemas"]["AnswerDetailResponse"];

// 날짜별 질문 + 답변 가져오기 옵션
export const answerOptions = {
  detail: (date: string) =>
    queryOptions({
      queryKey: ["currentUser", date],
      queryFn: async () => {
        const res = await api.get<ApiResponse<AnswerRes>>(
          `/api/v1/answers/calendar/${date}`,
        );
        return res.data.data!;
      },
      enabled: !!date,
    }),
};
