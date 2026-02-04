// 회원가입 및 비밀번호 변경 시 사용
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";

type Props = {
  // input field 밑에 뜨는 에러
  onCodeInvalid: (message: string) => void;
  onSuccess: () => void;
};

type Req = components["schemas"]["VerifyCodeRequest"];

export function useVerifyEmailCodeMutation({
  onCodeInvalid,
  onSuccess,
}: Props) {
  return useMutation({
    mutationFn: async ({ email, code, verificationType }: Req) => {
      await api.post("/api/v1/email/code/verification", {
        email,
        code,
        verificationType,
      });
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      switch (err.response?.data?.code) {
        case "EMAIL_VERIFICATION_CODE_MISMATCH":
          onCodeInvalid("입력한 정보를 한번 더 확인해주세요.");
          break;
        case "EMAIL_VERIFICATION_CODE_EXPIRED":
          onCodeInvalid("인증번호 입력 시간이 지났어요.");
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
