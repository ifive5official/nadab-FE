import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import type { ApiResponse } from "@/generated/api";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";
import { REPORT_CONFIGS } from "./reportConfigs";
import { isQaToolsEnabled } from "@/lib/qaTools";
import {
  getMonthlyReportFixtureLookup,
  getMonthlyReportV1Fixture,
  getMonthlyReportV2Fixture,
} from "./monthlyReportFixtures";
import useDeveloperOptionsStore from "@/store/developerOptionsStore";

type ReportRes = components["schemas"]["AnswerDetailResponse"];

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
type weeklyReportDetailRes = components["schemas"]["WeeklyReportResponse"];
type monthlyReportRes = components["schemas"]["MyMonthlyReportResponse"];
type monthlyReportLookupResV2 =
  components["schemas"]["MyMonthlyReportLookupResponseV2"];
type monthlyReportDetailRes = components["schemas"]["MonthlyReportResponse"];
type monthlyReportResV2 = components["schemas"]["MonthlyReportResponseV2"];
export type AllReportItem =
  components["schemas"]["AllReportItemResponseV2"];
type AllReportListResponse =
  components["schemas"]["AllReportListResponseV2"];
export type AllReportType = "ALL" | "WEEKLY" | "MONTHLY";
const REPORT_HISTORY_PAGE_SIZE = 7;

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

export const monthlyReportV2Options = queryOptions({
  queryKey: ["currentUser", "monthly-report-v2"] as const,
  queryFn: async () => {
    const fixture = getMonthlyReportFixtureLookup();
    if (fixture) return fixture;

    const res = await api.get<ApiResponse<monthlyReportLookupResV2>>(
      "/api/v2/monthly-report",
    );
    return res.data.data!;
  },
});

const reportHistoryOptions = (type: AllReportType) =>
  infiniteQueryOptions({
    queryKey: ["currentUser", "reports", "history", type] as const,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === "number" ? pageParam : 1;

      if (
        isQaToolsEnabled() &&
        useDeveloperOptionsStore.getState().isReportHistoryEmptyQaEnabled
      ) {
        return createEmptyAllReportListPage(page);
      }

      const res = await api.get<ApiResponse<AllReportListResponse>>(
        "/api/v2/monthly-report/all",
        {
          params: { type, page, size: REPORT_HISTORY_PAGE_SIZE },
        },
      );

      return normalizeAllReportListResponse(res.data.data, page);
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasNext
        ? (lastPage.currentPage ?? pages.length) + 1
        : undefined,
  });

export const allReportsOptions = reportHistoryOptions("ALL");
export const weeklyReportHistoryOptions = reportHistoryOptions("WEEKLY");
export const monthlyReportHistoryOptions = reportHistoryOptions("MONTHLY");

export const weeklyReportDetailOptions = (reportId: number) =>
  queryOptions({
    queryKey: ["currentUser", "weekly-report", reportId] as const,
    queryFn: async () => {
      const res = await api.get<ApiResponse<weeklyReportDetailRes>>(
        `/api/v1/weekly-report/${reportId}`,
      );
      return res.data.data!;
    },
    enabled: !!reportId,
  });

export const monthlyReportV1DetailOptions = (reportId: number) =>
  queryOptions({
    queryKey: ["currentUser", "monthly-report-v1", reportId] as const,
    queryFn: async () => {
      const fixture = getMonthlyReportV1Fixture(reportId);
      if (fixture) return fixture;

      const res = await api.get<ApiResponse<monthlyReportDetailRes>>(
        `/api/v1/monthly-report/${reportId}`,
      );
      return res.data.data!;
    },
    enabled: !!reportId,
  });

export const monthlyReportV2DetailOptions = (reportId: number) =>
  queryOptions({
    queryKey: ["currentUser", "monthly-report-v2", reportId] as const,
    queryFn: async () => {
      const fixture = getMonthlyReportV2Fixture(reportId);
      if (fixture) return fixture;

      const res = await api.get<ApiResponse<monthlyReportResV2>>(
        `/api/v2/monthly-report/${reportId}`,
      );
      return res.data.data!;
    },
    enabled: !!reportId,
  });

// 이전 리포트 목록 페이지 응답을 안전한 pagination shape로 맞춥니다.
function normalizeAllReportListResponse(
  data: AllReportListResponse | undefined,
  page: number,
): AllReportListResponse {
  if (!isRecord(data)) {
    return createEmptyAllReportListPage(page);
  }

  return {
    items: Array.isArray(data.items) ? data.items.filter(isAllReportItem) : [],
    totalCount: typeof data.totalCount === "number" ? data.totalCount : 0,
    currentPage:
      typeof data.currentPage === "number" ? data.currentPage : page,
    pageSize:
      typeof data.pageSize === "number"
        ? data.pageSize
        : REPORT_HISTORY_PAGE_SIZE,
    totalPages: typeof data.totalPages === "number" ? data.totalPages : 0,
    hasPrevious:
      typeof data.hasPrevious === "boolean" ? data.hasPrevious : page > 1,
    hasNext: typeof data.hasNext === "boolean" ? data.hasNext : false,
  };
}

// QA 빈 목록 모드에서도 실제 pagination 응답과 같은 모양을 반환합니다.
function createEmptyAllReportListPage(page: number): AllReportListResponse {
  return {
    items: [],
    totalCount: 0,
    currentPage: page,
    pageSize: REPORT_HISTORY_PAGE_SIZE,
    totalPages: 0,
    hasPrevious: page > 1,
    hasNext: false,
  };
}

function isAllReportItem(data: unknown): data is AllReportItem {
  return isRecord(data) && ("id" in data || "type" in data || "period" in data);
}

function isRecord(data: unknown): data is Record<string, unknown> {
  return typeof data === "object" && data !== null;
}

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
