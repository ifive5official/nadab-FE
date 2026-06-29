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

// 소셜 정지 상태 조회
type SuspensionStatusRes = components["schemas"]["SuspensionStatusResponse"];

export const suspensionStatusOptions = queryOptions({
  queryKey: ["currentUser", "suspensionStatus"],
  queryFn: async () => {
    const res = await api.get<ApiResponse<SuspensionStatusRes>>(
      "/api/v1/moderation/suspension/status",
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
type BlockedFriendsRes = components["schemas"]["BlockedUserListResponse"];

export const blockedFriendsOptions = queryOptions({
  queryKey: ["currentUser", "friends", "blocked"],
  queryFn: async () => {
    const res = await api.get<ApiResponse<BlockedFriendsRes>>(
      "/api/v1/moderation/blocks",
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
