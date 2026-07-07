import { queryOptions } from "@tanstack/react-query";
import type { ApiResponse } from "@/generated/api";
import type { CurrentUser } from "@/types/currentUser";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";

export const currentUserOptions = queryOptions({
  queryKey: ["currentUser"],

  queryFn: async () => {
    const res = await api.get<ApiResponse<CurrentUser>>("/api/v1/user/me");

    return res.data.data!;
  },
});

type CrystalsRes = components["schemas"]["WalletBalanceResponse"];

export const crystalsOptions = queryOptions({
  queryKey: ["currentUser", "crystals"],
  queryFn: async () => {
    const res = await api.get<ApiResponse<CrystalsRes>>(
      "/api/v1/wallet/balance"
    );
    return res.data.data!;
  },
  // Todo: 에러 처리
});
