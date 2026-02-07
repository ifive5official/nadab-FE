// 이메일 인증 코드 발송 + 중복 확인
// 회원가입 및 비밀번호 변경 시 사용
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

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
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      switch (err.response?.data?.code) {
        case "EMAIL_ALREADY_EXISTS":
          onEmailInvalid?.("이미 가입한 회원이에요.");
          break;
        case "EMAIL_NOT_REGISTERED":
        case "USER_NOT_FOUND":
          onEmailInvalid?.("해당 이메일로 가입한 계정이 없어요.");
          break;
        case "EMAIL_SOCIAL_ACCOUNT_PASSWORD_RESET_FORBIDDEN":
          onEmailInvalid?.("소셜 로그인 계정은 비밀번호 찾기를 할 수 없어요.");
          break;
        case "EMAIL_WITHDRAWN_ACCOUNT_SIGNUP_FORBIDDEN":
          onEmailInvalid?.(
            "탈퇴된 계정이에요. 로그인해서 계정 복구를 진행해 주세요.",
          );
          break;
        default:
          handleDefaultApiError(err);
      }
    },
  });
}
