// 닉네임과 프로필 이미지 수정
// 온보딩 및 프로필 수정 페이지에서 사용
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/modalStore";
import type { AxiosError } from "axios";
import type { ApiErrResponse, ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import type { CurrentUser } from "@/types/currentUser";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

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
      const updatedData = data.data!;
      queryClient.setQueryData(["currentUser"], (oldData: CurrentUser) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          nickname: updatedData.nickname,
          profileImageUrl: updatedData.profileImageUrl,
        };
      });
      onSuccess?.(updatedData);
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      if (err.response?.data?.code === "NICKNAME_CHANGE_LIMIT_EXCEEDED") {
        useErrorStore
          .getState()
          .showError(
            "변경 횟수가 소진되었어요.",
            "닉네임 변경은 14일 내에 최대 2번까지 가능해요.",
          );
      } else {
        handleDefaultApiError(err);
      }
    },
  });
}
