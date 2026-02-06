// 닉네임 체크
// 온보딩 및 프로필 수정 시 사용
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

type Props = {
  // input field 밑에 뜨는 에러
  onSuccess?: (data: Res) => void;
};

type Res = components["schemas"]["CheckNicknameResponse"];

export function useCheckNicknameMutation({ onSuccess }: Props) {
  return useMutation({
    mutationFn: async ({ nickname }: { nickname: string }) => {
      const res = await api.get<ApiResponse<Res>>(
        `/api/v1/user/check-nickname?nickname=${nickname}`,
      );
      return res.data;
    },
    onSuccess: (data) => {
      onSuccess?.(data.data!);
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
