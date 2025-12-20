// 이메일 인증 코드 발송 + 중복 확인
// 회원가입 및 비밀번호 변경 시 사용
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";

type Props = {
  // input field 밑에 뜨는 에러
  onEmailInvalid?: (message: string) => void;
  onSuccess?: (email: string) => void;
};

type Req = components["schemas"]["SendVerificationCodeRequest"];

export function useSendEmailCodeMutation({ onEmailInvalid, onSuccess }: Props) {
  return useMutation({
    mutationFn: async ({ email, verificationType }: Req) => {
      await api.post("/api/v1/email/code", {
        email,
        verificationType,
      });
    },
    onSuccess: (_, { email }) => {
      onSuccess?.(email);
    },
    onError: (err: AxiosError<ApiResponse<null>>) => {
      if (err.response?.status === 409) {
        // 회원가입 시
        onEmailInvalid?.("이미 가입한 회원이에요.");
      } else if (err.response?.status === 404) {
        // 비밀번호 변경 시
        onEmailInvalid?.("해당 이메일로 가입된 계정이 없습니다.");
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
