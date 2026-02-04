// 질문 리롤
// 홈에서 사용
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/modalStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";

type Res = components["schemas"]["DailyQuestionResponse"];

export function useRerollQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<Res>>("/api/v1/question/reroll");
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser", "question"], data.data);
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      switch (err.response?.data?.code) {
        case "DAILY_QUESTION_NOT_FOUND":
          useErrorStore
            .getState()
            .showError(
              "오늘의 질문이 아직 생성되지 않았어요.",
              "잠시 후 다시 시도해 주세요.",
            );
          break;
        case "QUESTION_NO_ALTERNATIVE":
          useErrorStore.getState().showError("이 주제의 질문에 전부 답했어요.");
          break;
        case "QUESTION_REROLL_LIMIT_EXCEEDED":
          useErrorStore
            .getState()
            .showError("오늘의 질문 변경 횟수가\n소진되었어요.");
          break;
        default:
          useErrorStore.getState().showError(
            // Todo: 에러 메시지 변경
            err.response?.data?.code ?? err.message,
            err.response?.data?.message ??
              "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요.",
          );
      }
    },
  });
}
