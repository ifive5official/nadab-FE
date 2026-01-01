// 질문 리롤
// 홈에서 사용
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/generated/api";
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
    onError: (err: AxiosError<ApiResponse<null>>) => {
      if (err.response?.status === 400) {
        useErrorStore
          .getState()
          .showError("오늘의 질문 변경 횟수가\n소진되었어요.");
      } else {
        useErrorStore.getState().showError(
          // Todo: 에러 메시지 변경
          err.message,
          err.response?.data?.message ??
            "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요."
        );
      }
    },
  });
}
