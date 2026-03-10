import { queryOptions } from "@tanstack/react-query";
import type { ApiResponse } from "@/generated/api";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";

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
  queryKey: ["currentUser", "friends"],
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
