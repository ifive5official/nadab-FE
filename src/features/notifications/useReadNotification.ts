// 알림 읽음 처리
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";

export function useReadNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notificationId }: { notificationId: number }) => {
      const res = await api.patch(
        `/api/v1/notifications/${notificationId}/read`,
      );
      return res.data;
    },
    onSuccess: () => {
      // 읽은 후 알림 목록 리셋
      queryClient.invalidateQueries({
        queryKey: ["currentUser", "notifications"],
      });
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
