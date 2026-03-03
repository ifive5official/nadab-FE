// 알림 설정 수정
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";
import type { components } from "@/generated/api-types";

type notificationSetting = components["schemas"]["NotificationSettingResponse"];
type Req = components["schemas"]["UpdateNotificationSettingRequest"];

type Props = {
  onSuccess?: (message: string) => void;
};

export function useChangeNotificationSettingsMutation({ onSuccess }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (req: Req) => {
      const res = await api.patch(`/api/v1/notifications/settings`, [req]);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      // 변경사항 바로 반영
      queryClient.setQueryData(
        ["currentUser", "notificationSettings"],
        (oldData: notificationSetting[]) => {
          if (!oldData) return [variables];
          return oldData.map((old) => {
            if (old.group === variables.group) {
              return {
                group: variables.group,
                enabled: variables.enabled,
                dailyWriteTime: variables.dailyWriteTime ?? old.dailyWriteTime,
              };
            } else {
              return old;
            }
          });
        },
      );
      let message = "";
      if (variables.group === "ACTIVITY_REMINDER") {
        if (variables.enabled) {
          message = variables.dailyWriteTime
            ? "활동 알림 시간 변경이 완료되었어요."
            : "활동 알림이 설정되었어요.";
        }
      } else if (variables.group === "REPORT" && variables.enabled) {
        message = "리포트 알림이 설정되었어요.";
      } else if (variables.group === "SOCIAL" && variables.enabled) {
        message = "소셜 알림이 설정되었어요.";
      }
      onSuccess?.(message);
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
