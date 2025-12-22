import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/generated/api";
import { useNavigate } from "@tanstack/react-router";
import type { components } from "@/generated/api-types";
import useAuthStore from "@/store/authStore";
import useRestoreStore from "@/store/restoreStore";

type Res = components["schemas"]["TokenResponse"];
type ErrRes = components["schemas"]["WithdrawnInfoResponse"];

type Props = {
  onPasswordInvalid: (message: string) => void;
};

export function useLoginMutation({ onPasswordInvalid }: Props) {
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
    onError: (err: AxiosError<ApiResponse<ErrRes>>, { email, password }) => {
      if (
        err.response?.status === 400 &&
        err.response.data.message ===
          "탈퇴한 계정입니다. 계정 복구를 진행해주세요."
      ) {
        useRestoreStore.getState().setEmail(email);
        useRestoreStore.getState().setPassword(password ?? "");
        useRestoreStore
          .getState()
          .setNickname(err.response.data.data?.nickname ?? "");
        useRestoreStore
          .getState()
          .setDeletionDate(err.response.data.data?.deletionDate ?? "");
        navigate({ to: "/restore" });
      } else if (
        err.response?.status === 400 ||
        err.response?.status === 401 ||
        err.response?.status === 404
      ) {
        onPasswordInvalid("잘못된 비밀번호입니다. 다시 확인하세요.");
        // 명시적으로 분리해서 메시지를 주는 게 나을까?
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
