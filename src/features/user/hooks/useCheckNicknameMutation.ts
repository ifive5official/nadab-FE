// 닉네임 체크
// 온보딩 및 프로필 수정 시 사용
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";

type Props = {
  // input field 밑에 뜨는 에러
  onNicknameInvalid?: (message: string) => void;
  onSuccess?: (data: Res) => void;
};

type Res = components["schemas"]["CheckNicknameResponse"];

export function useCheckNicknameMutation({
  onNicknameInvalid,
  onSuccess,
}: Props) {
  return useMutation({
    mutationFn: async ({ nickname }: { nickname: string }) => {
      const res = await api.get<ApiResponse<Res>>(
        `/api/v1/user/check-nickname?nickname=${nickname}`
      );
      return res.data;
    },
    onSuccess: (data) => {
      onSuccess?.(data.data!);
    },
    onError: (err: AxiosError<ApiResponse<null>>) => {
      if (err.response?.status === 409) {
        onNicknameInvalid?.("이미 가입한 회원이에요.");
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
