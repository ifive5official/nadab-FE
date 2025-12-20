// 관심 주제 설정 및 업데이트
// 온보딩 및 프로필 수정 페이지에서 사용
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";

type Props = {
  onSuccess?: (interestCode: string) => void;
};

type Req = components["schemas"]["UpdateUserInterestRequest"];

export function useUpdateInterestMutation({ onSuccess }: Props) {
  return useMutation({
    mutationFn: async ({ interestCode }: Req) => {
      await api.patch("/api/v1/user/interest", {
        interestCode,
      });
    },
    onSuccess: (_, { interestCode }) => {
      onSuccess?.(interestCode);
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
