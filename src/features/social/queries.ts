import { queryOptions } from "@tanstack/react-query";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";
import type { AxiosError } from "axios";

// 피드 기능 =============================================

type FeedRes = components["schemas"]["FeedListResponse"];

export const feedOptions = queryOptions({
  queryKey: ["currentUser", "feeds"],
  queryFn: async () => {
    const res = await api.get<ApiResponse<FeedRes>>("/api/v1/feed");
    return res.data.data!;
  },
});

type feedShareStatusRes = components["schemas"]["ShareStatusResponse"];

export const feedShareStatusOptions = queryOptions({
  queryKey: ["currentUser", "feedShareStatus"],
  queryFn: async () => {
    const res = await api.get<ApiResponse<feedShareStatusRes>>(
      "/api/v1/feed/share/status",
    );
    return res.data.data!;
  },
  retry: (failureCount, err: AxiosError<ApiErrResponse<null>>) => {
    // 아직 오늘의 질문에 답하지 않았다고 응답이 오면 재시도 하지 않음
    if (err.response?.data?.code === "DAILY_REPORT_NOT_FOUND") {
      return false;
    }
    // 그 외의 에러는 기본값
    return failureCount < 3;
  },
});

// 친구 기능 ===============================================
type FriendsRes = components["schemas"]["FriendListResponse"];

export const friendsOptions = queryOptions({
  queryKey: ["currentUser", "friends", "list"],
  queryFn: async () => {
    const res = await api.get<ApiResponse<FriendsRes>>("/api/v1/friends");
    return res.data.data!;
  },
});

type FriendRequestsRes = components["schemas"]["PendingFriendListResponse"];

export const friendRequestsOptions = queryOptions({
  queryKey: ["currentUser", "friendRequests"],
  queryFn: async () => {
    const res = await api.get<ApiResponse<FriendRequestsRes>>(
      "/api/v1/friends/requests",
    );
    return res.data.data!;
  },
});

type FriendSearchHistoriesRes =
  components["schemas"]["SearchHistoryListResponse"];

export const friendSearchHistoryOptions = queryOptions({
  queryKey: ["currentUser", "friends", "searchHistories"],
  queryFn: async () => {
    const res = await api.get<ApiResponse<FriendSearchHistoriesRes>>(
      "/api/v1/friends/search/histories",
    );
    return res.data.data!;
  },
});
