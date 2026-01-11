import { queryOptions } from "@tanstack/react-query";
import type { ApiResponse } from "@/generated/api";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";

type SearchHistoriesRes = components["schemas"]["SearchHistoryListResponse"];

export const searchHistoryOptions = queryOptions({
  queryKey: ["currentUser", "searchKeywords"],
  queryFn: async () => {
    const res = await api.get<ApiResponse<SearchHistoriesRes>>(
      "/api/v1/search/histories"
    );
    return res.data.data!;
  },
});
