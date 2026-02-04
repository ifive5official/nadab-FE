// 소셜 로그인 시 약관 동의 위해 사용
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";

type Props = {
  onSuccess?: () => void;
};

export function useTermsConsentMutation({ onSuccess }: Props) {
  return useMutation({
    mutationFn: async ({
      isMarketingTermsAgreed,
    }: {
      isMarketingTermsAgreed: boolean;
    }) => {
      const res = await api.post("/api/v1/terms/consent", {
        service: true,
        privacy: true,
        ageVerification: true,
        marketing: isMarketingTermsAgreed,
      });
      return res.data;
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      useErrorStore.getState().showError(
        // Todo: 에러 메시지 변경
        err.response?.data?.code ?? err.message,
        err.response?.data?.message ??
          "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요.",
      );
    },
  });
}
