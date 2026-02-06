// 프로필 이미지 삭제
// 프로필 수정 페이지에서 사용 - 프로필 수정 api 호출과 같은 시점에 사용!!
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

export function useDeleteProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.delete("/api/v1/user/me/profile-image");
      return res.data;
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}
