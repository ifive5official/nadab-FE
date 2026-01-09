import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import { useNavigate } from "@tanstack/react-router";
import type { components } from "@/generated/api-types";
import useAuthStore from "@/store/authStore";
import useRestoreStore from "@/store/restoreStore";

type Res = components["schemas"]["TokenResponse"];
type ErrRes = components["schemas"]["WithdrawnInfoResponse"];

type Props = {
  onEmailInvalid: (message: string) => void;
  onPasswordInvalid: (message: string) => void;
};

export function useLoginMutation({ onEmailInvalid, onPasswordInvalid }: Props) {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const res = await api.post<ApiResponse<Res>>("/api/v1/auth/login", {
        email,
        password,
      });
      return res.data;
    },
    onSuccess: (res) => {
      const { accessToken } = res.data!;
      useAuthStore.getState().setAccessToken(accessToken!);
      navigate({ to: "/" });
    },
    onError: (err: AxiosError<ApiErrResponse<ErrRes>>, { email, password }) => {
      switch (err.response?.data?.code) {
        case "AUTH_ACCOUNT_WITHDRAWN":
          useRestoreStore.getState().setEmail(email);
          useRestoreStore.getState().setPassword(password ?? "");
          useRestoreStore
            .getState()
            .setNickname(err.response.data.data?.nickname ?? "");
          useRestoreStore
            .getState()
            .setDeletionDate(err.response.data.data?.deletionDate ?? "");
          navigate({ to: "/restore" });
          break;
        case "VALIDATION_FAILED":
          onEmailInvalid("올바른 형식의 이메일 주소를 입력해주세요.");
          break;
        case "AUTH_INVALID_PASSWORD":
          onPasswordInvalid("잘못된 비밀번호예요. 다시 확인하세요.");
          break;
        case "USER_NOT_FOUND":
          onPasswordInvalid("잘못된 비밀번호예요. 다시 확인하세요.");
          break;
        case "AUTH_REFRESH_TOKEN_NOT_FOUND":
          // Todo: 리프레시 에러가 자꾸 떠서 임시로 막았는데 이게 왜 됨?
          onPasswordInvalid("잘못된 비밀번호예요. 다시 확인하세요.");
          break;
        default:
          useErrorStore.getState().showError(
            // Todo: 에러 메시지 변경
            err.response?.data?.code ?? err.message,
            err.response?.data?.message ??
              "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요."
          );
      }
    },
  });
}
