import { queryOptions } from "@tanstack/react-query";
import type { ApiResponse } from "@/generated/api";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";

type HomeRes = components["schemas"]["HomeResponse"];

export const homeOptions = queryOptions({
  queryKey: ["currentUser", "home"],
  queryFn: async () => {
    const res = await api.get<ApiResponse<HomeRes>>("/api/v1/home");
    return res.data.data!;
  },
});
