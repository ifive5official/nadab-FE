import { queryOptions } from "@tanstack/react-query";
import type { ApiResponse } from "@/generated/api";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";

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
  queryKey: ["currentUser", "friends", "searchKeywords"],
  queryFn: async () => {
    const res = await api.get<ApiResponse<FriendSearchHistoriesRes>>(
      "/api/v1/friends/search/histories",
    );
    return res.data.data!;
  },
});
