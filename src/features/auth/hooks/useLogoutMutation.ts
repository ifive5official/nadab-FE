import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import useAuthStore from "@/store/authStore";
import { handleDefaultApiError } from "@/lib/handleDefaultError";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

export function useLogoutMutation() {
  const clearAuth = useAuthStore.use.clearAuth();
  const deviceId = useAuthStore.use.deviceId();

  return useMutation({
    mutationFn: async () => {
      if (Capacitor.isNativePlatform() && deviceId) {
        await api.delete(`/api/v1/notifications/tokens/${deviceId}/ANDROID`);
        await PushNotifications.removeAllListeners();
      }
      await api.post("/api/v1/auth/logout");
    },
    onSuccess: () => {
      clearAuth();
      window.location.href = "/";
    },
    onError: (err: AxiosError<ApiErrResponse<null>>) => {
      handleDefaultApiError(err);
    },
  });
}
