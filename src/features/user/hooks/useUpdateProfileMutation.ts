// 닉네임과 프로필 이미지 수정
// 온보딩 및 프로필 수정 페이지에서 사용
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";

type Props = {
  onSuccess?: (data: Res) => void;
};

type Req = components["schemas"]["UpdateUserProfileRequest"];
type Res = components["schemas"]["UpdateUserProfileResponse"];

export function useUpdateProfileMutation({ onSuccess }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nickname, objectKey }: Req) => {
      const res = await api.patch<ApiResponse<Res>>("/api/v1/user/me", {
        nickname,
        objectKey,
      });
      return res.data;
    },
    onSuccess: (data) => {
      onSuccess?.(data.data!);
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      useErrorStore.getState().showError(
        // Todo: 에러 메시지 변경
        err.response?.data?.code ?? err.message,
        err.response?.data?.message ??
          "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요."
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}
