// 알림 여부 업데이트
// 마이페이지에서 사용
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";

type Props = {
  onSuccess: (newSetting: boolean) => void;
};

type Req = components["schemas"]["UpdateMarketingConsentRequest"];

export function useToggleNotificationMutation({ onSuccess }: Props) {
  const queryClient = useQueryClient();
  const NOTIFICATION_QUERY_KEY = ["currentUser", "notification"];

  return useMutation({
    mutationFn: async ({ agreed }: Req) => {
      await api.patch("/api/v1/terms/consent/marketing", {
        agreed,
      });
    },
    onMutate: async ({ agreed }: Req) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_QUERY_KEY });
      const previousEnabled = queryClient.getQueryData(NOTIFICATION_QUERY_KEY);

      if (previousEnabled) {
        queryClient.setQueryData(NOTIFICATION_QUERY_KEY, agreed);
      }

      return { previousEnabled };
    },
    onSuccess: (_data, { agreed }) => {
      onSuccess(agreed);
    },
    onError: (err: AxiosError<ApiErrResponse<null>>, _, context) => {
      // 에러 발생 시 원래 데이터로 복구
      if (context?.previousEnabled) {
        queryClient.setQueryData(
          NOTIFICATION_QUERY_KEY,
          context.previousEnabled,
        );
      }
      useErrorStore.getState().showError(
        // Todo: 에러 메시지 변경
        err.response?.data?.code ?? err.message,
        err.response?.data?.message ??
          "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요.",
      );
    },
    onSettled: () => {
      // 성공/실패 여부와 상관없이 서버와 데이터 동기화
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });
    },
  });
}
