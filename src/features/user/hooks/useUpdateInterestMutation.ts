// 선택 주제 설정 및 업데이트
// 온보딩 및 프로필 수정 페이지에서 사용
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { handleDefaultApiError } from "@/lib/handleDefaultError";
import type { CurrentUser } from "@/types/currentUser";

type Props = {
  onSuccess?: (interestCode: string) => void;
};

type Req = components["schemas"]["UpdateUserInterestRequest"];

export function useUpdateInterestMutation({ onSuccess }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ interestCode }: Req) => {
      await api.patch("/api/v1/user/interest", {
        interestCode,
      });
    },
    onSuccess: (_, { interestCode }) => {
      // 유저 정보(카테고리 포함) 업데이트
      queryClient.setQueryData(
        ["currentUser"],
        (oldData: CurrentUser | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            interestCode,
          };
        },
      );
      onSuccess?.(interestCode);
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
