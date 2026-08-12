import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { api } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  askChatKeys,
  type AskChatHistoryDetail,
} from "./queries";
import type { AskChatQuestionSendResult } from "./useStartAskChatSessionMutation";
import { handleAskChatApiError } from "./error";
import { isAskChatSessionReadOnly } from "./session";

type Request = components["schemas"]["AskChatQuestionRequest"];

type Props = {
  onSuccess?: (data: AskChatQuestionSendResult) => void;
};

// 활성 세션에 후속 질문을 보내고 최신 대화권 정보를 반영합니다.
export function useSendAskChatQuestionMutation({ onSuccess }: Props = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Request) => {
      const res = await api.post<ApiResponse<AskChatQuestionSendResult>>(
        "/api/v1/ask-chat/messages",
        request,
      );
      return res.data.data!;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(askChatKeys.remainingTurns(), {
        remainingMessageCount: data.remainingMessageCount,
      });
      queryClient.setQueryData<AskChatHistoryDetail>(
        askChatKeys.historyDetail(variables.sessionId),
        (previous) => ({
          ...previous,
          sessionId: variables.sessionId,
          status: data.session?.status ?? previous?.status,
          answeredTurnCount:
            data.session?.answeredTurnCount ?? previous?.answeredTurnCount,
          readOnly: data.session
            ? isAskChatSessionReadOnly(data.session)
            : previous?.readOnly,
          messages: [
            ...(previous?.messages ?? []),
            ...[data.userMessage, data.assistantMessage].filter(
              (message): message is NonNullable<typeof message> => !!message,
            ),
          ],
        }),
      );
      queryClient.invalidateQueries({ queryKey: askChatKeys.histories() });
      onSuccess?.(data);
    },
    onError: (error: AxiosError<ApiErrResponse<null>>) => {
      handleAskChatApiError(error);
    },
  });
}
