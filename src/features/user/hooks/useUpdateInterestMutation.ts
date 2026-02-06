// 관심 주제 설정 및 업데이트
// 온보딩 및 프로필 수정 페이지에서 사용
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import type { CurrentUser } from "@/types/currentUser";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type Props = {
  onSuccess?: (interestCode: string) => void;
};

type Req = components["schemas"]["UpdateUserInterestRequest"];

export function useUpdateInterestMutation({ onSuccess }: Props) {
  const queryClient = useQueryClient();
  const USER_QUERY_KEY = ["currentUser"];

  return useMutation({
    mutationFn: async ({ interestCode }: Req) => {
      await api.patch("/api/v1/user/interest", {
        interestCode,
      });
    },
    onMutate: async (newInterest) => {
      await queryClient.cancelQueries({ queryKey: USER_QUERY_KEY });
      const previousUser = queryClient.getQueryData(USER_QUERY_KEY);

      if (previousUser) {
        queryClient.setQueryData(USER_QUERY_KEY, (old: CurrentUser) => ({
          ...old,
          interestCode: newInterest.interestCode,
        }));
      }

      return { previousUser };
    },
    onSuccess: (_, { interestCode }) => {
      onSuccess?.(interestCode);
    },
    onError: (err: AxiosError<ApiErrResponse<null>>, _newInterest, context) => {
      // 에러 발생 시 원래 데이터로 복구
      if (context?.previousUser) {
        queryClient.setQueryData(USER_QUERY_KEY, context.previousUser);
      }
      handleDefaultApiError(err);
    },
    onSettled: () => {
      // 성공/실패 여부와 상관없이 서버와 데이터 동기화
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });
}
