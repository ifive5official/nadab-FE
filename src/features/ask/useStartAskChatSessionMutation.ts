import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { api } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  askChatKeys,
  type AskChatHistoryDetail,
} from "./queries";
import { isAskChatSessionReadOnly } from "./session";
import { handleAskChatApiError } from "./error";

type Request = components["schemas"]["AskChatSessionStartRequest"];
export type AskChatQuestionSendResult =
  components["schemas"]["AskChatQuestionSendResponse"];

type Props = {
  onSuccess?: (data: AskChatQuestionSendResult) => void;
};

// 첫 질문을 전송하면서 새로운 물어보기 세션을 시작합니다.
export function useStartAskChatSessionMutation({ onSuccess }: Props = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Request) => {
      const res = await api.post<ApiResponse<AskChatQuestionSendResult>>(
        "/api/v1/ask-chat/sessions",
        request,
      );
      return res.data.data!;
    },
    onSuccess: (data) => {
      const sessionId = data.session?.sessionId;
      if (sessionId) {
        queryClient.setQueryData(askChatKeys.sessionResult(sessionId), data);
        queryClient.setQueryData<AskChatHistoryDetail>(
          askChatKeys.historyDetail(sessionId),
          {
            sessionId,
            status: data.session?.status,
            answeredTurnCount: data.session?.answeredTurnCount,
            readOnly: isAskChatSessionReadOnly(data.session),
            messages: [data.userMessage, data.assistantMessage].filter(
              (message): message is NonNullable<typeof message> => !!message,
            ),
          },
        );
      }
      queryClient.setQueryData(askChatKeys.remainingTurns(), {
        remainingMessageCount: data.remainingMessageCount,
      });
      queryClient.invalidateQueries({ queryKey: askChatKeys.histories() });
      onSuccess?.(data);
    },
    onError: (error: AxiosError<ApiErrResponse<null>>) => {
      handleAskChatApiError(error);
    },
  });
}
