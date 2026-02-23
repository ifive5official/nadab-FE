// 유형 리포트 생성 뮤테이션
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { handleDefaultApiError } from "@/lib/handleDefaultError";
import type categories from "@/constants/categories";
import useModalStore from "@/store/modalStore";

type generateTypeReportRes = components["schemas"]["TypeReportStartResponse"];

type Props = {
  onSuccess?: () => void;
  interestCode: (typeof categories)[number]["code"];
};

export function useGenerateTypeReportMutation({
  onSuccess,
  interestCode,
}: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<generateTypeReportRes>>(
        `/api/v1/type-report/start/${interestCode}`,
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUser", "type-report"],
      });
      onSuccess?.();
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      if (err.response?.data?.code === `TYPE_REPORT_NOT_ENOUGH_REPORTS`) {
        useModalStore
          .getState()
          .showError(
            `유형 리포트가 완성되지 못했어요.`,
            `기록을 열심히 작성해서\n 리포트를 완성해봐요.`,
          );
      } else {
        handleDefaultApiError(err);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser", "crystals"] });
    },
  });
}
