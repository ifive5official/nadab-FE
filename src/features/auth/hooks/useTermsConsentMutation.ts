// 소셜 로그인 시 약관 동의 위해 사용
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

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
      handleDefaultApiError(err);
    },
  });
}
