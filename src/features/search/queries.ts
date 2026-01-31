import { queryOptions } from "@tanstack/react-query";
import type { ApiResponse } from "@/generated/api";
import { api } from "@/lib/axios";
// import type { components } from "@/generated/api-types";

// 왜 타입이 이상하냐
// Todo: 백엔드 고쳐주면 수정
type SearchHistoriesRes = {
  histories?: {
    id?: number;
    keyword?: string;
  }[];
};

export const searchHistoryOptions = queryOptions({
  queryKey: ["currentUser", "searchKeywords"],
  queryFn: async () => {
    const res = await api.get<ApiResponse<SearchHistoriesRes>>(
      "/api/v1/search/histories",
    );
    return res.data.data!;
  },
});
