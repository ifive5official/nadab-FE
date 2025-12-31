// 닉네임 체크
// 온보딩 및 프로필 수정 시 사용
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";

type Props = {
  onSuccess?: () => void;
};

type Req = components["schemas"]["DailyReportRequest"];
type Res = components["schemas"]["CreateDailyReportResponse"];

export function useGenerateReportMutation({ onSuccess }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, answer }: Req) => {
      const res = await api.post<ApiResponse<Res>>(
        `/api/v1/daily-report/generate`,
        {
          questionId,
          answer,
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      const today = new Date().toLocaleDateString("sv-SE", {
        timeZone: "Asia/Seoul",
      });
      queryClient.invalidateQueries({ queryKey: ["currentUser", "crystals"] });
      queryClient.setQueryData(["currentUser", "report", today], data.data);
      onSuccess?.();
    },
    onError: (err: AxiosError<ApiResponse<null>>) => {
      useErrorStore.getState().showError(
        // Todo: 에러 메시지 변경
        err.message,
        err.response?.data?.message ??
          "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요."
      );
    },
  });
}
