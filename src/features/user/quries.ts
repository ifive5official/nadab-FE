import { queryOptions } from "@tanstack/react-query";
import type { ApiResponse } from "@/generated/api";
import type { CurrentUser } from "@/types/currentUser";
import { api } from "@/lib/axios";

export const currentUserOptions = queryOptions({
  queryKey: ["currentUser"],

  queryFn: async () => {
    const res = await api.get<ApiResponse<CurrentUser>>("/api/v1/user/me");

    return res.data.data!;
  },
});
