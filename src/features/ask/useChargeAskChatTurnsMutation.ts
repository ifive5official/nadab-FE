import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { api } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { askChatKeys, type AskChatHome } from "./queries";
import { handleAskChatApiError } from "./error";

type Result = components["schemas"]["AskChatTurnChargeResponse"];

type Props = {
  onSuccess?: (data: Result) => void;
};

// 크리스탈을 사용해 물어보기 대화권을 충전하고 관련 캐시를 갱신합니다.
export function useChargeAskChatTurnsMutation({ onSuccess }: Props = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<Result>>(
        "/api/v1/ask-chat/turns/charge",
      );
      return res.data.data!;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(askChatKeys.remainingTurns(), {
        remainingMessageCount: data.remainingMessageCount,
      });
      queryClient.setQueryData<AskChatHome>(askChatKeys.home(), (previous) =>
        previous
          ? {
              ...previous,
              crystalBalance: data.crystalBalance,
              remainingMessageCount: data.remainingMessageCount,
            }
          : previous,
      );
      queryClient.setQueryData(["currentUser", "crystals"], {
        crystalBalance: data.crystalBalance,
      });
      onSuccess?.(data);
    },
    onError: (error: AxiosError<ApiErrResponse<null>>) => {
      handleAskChatApiError(error);
    },
  });
}
