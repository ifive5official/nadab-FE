import type { ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { api } from "@/lib/axios";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

export type AskChatHome = components["schemas"]["AskChatHomeResponse"];
export type AskChatHistoryList =
  components["schemas"]["AskChatHistoryListResponse"];
export type AskChatHistoryDetail =
  components["schemas"]["AskChatHistoryDetailResponse"];
export type AskChatRemainingTurns =
  components["schemas"]["AskChatRemainingMessageCountResponse"];

export const askChatKeys = {
  all: ["currentUser", "askChat"] as const,
  home: () => [...askChatKeys.all, "home"] as const,
  remainingTurns: () => [...askChatKeys.all, "remainingTurns"] as const,
  histories: () => [...askChatKeys.all, "histories"] as const,
  historyDetail: (sessionId: number) =>
    [...askChatKeys.histories(), sessionId] as const,
  sessionResult: (sessionId: number) =>
    [...askChatKeys.all, "sessionResult", sessionId] as const,
};

// 물어보기 홈에 필요한 사용자 정보, 대화권, 예시 질문을 조회합니다.
export const askChatHomeOptions = queryOptions({
  queryKey: askChatKeys.home(),
  queryFn: async () => {
    const res = await api.get<ApiResponse<AskChatHome>>(
      "/api/v1/ask-chat/home",
    );
    return res.data.data!;
  },
});

// 질문 전송이나 충전 뒤 남은 대화 횟수만 다시 조회합니다.
export const askChatRemainingTurnsOptions = queryOptions({
  queryKey: askChatKeys.remainingTurns(),
  queryFn: async () => {
    const res = await api.get<ApiResponse<AskChatRemainingTurns>>(
      "/api/v1/ask-chat/turns/remaining",
    );
    return res.data.data!;
  },
});

// 물어보기 대화 기록을 최신순으로 페이지 단위 조회합니다.
export const askChatHistoriesOptions = (size = 20) =>
  infiniteQueryOptions({
    queryKey: [...askChatKeys.histories(), { size }] as const,
    queryFn: async ({ pageParam }) => {
      const res = await api.get<ApiResponse<AskChatHistoryList>>(
        "/api/v1/ask-chat/histories",
        { params: { page: pageParam, size } },
      );
      return res.data.data!;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.currentPage ?? 1) + 1 : undefined,
  });

// 선택한 물어보기 세션의 전체 메시지와 읽기 전용 상태를 조회합니다.
export const askChatHistoryDetailOptions = (sessionId: number) =>
  queryOptions({
    queryKey: askChatKeys.historyDetail(sessionId),
    queryFn: async () => {
      const res = await api.get<ApiResponse<AskChatHistoryDetail>>(
        `/api/v1/ask-chat/histories/${sessionId}`,
      );
      return res.data.data!;
    },
    enabled: Number.isFinite(sessionId) && sessionId > 0,
  });
