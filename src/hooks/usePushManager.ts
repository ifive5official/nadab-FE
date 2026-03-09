import { useCallback, useEffect } from "react";
import { PushNotifications } from "@capacitor/push-notifications";
import useAuthStore from "@/store/authStore";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import { api } from "@/lib/axios";
import {
  type Notification,
  NOTIFICATION_CONFIG,
} from "@/features/notifications/notificationConfigs";
import { router } from "@/main";
import usePushToastStore from "@/store/pushToastStore";

export function usePushNotifications() {
  const { accessToken: isLoggedIn, deviceId, setDeviceId } = useAuthStore();
  const { showToast } = usePushToastStore();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      // 웹에서는 아무 동작 안 함
      return;
    }
    async function initDevice() {
      if (!deviceId) {
        const { identifier } = await Device.getId();
        setDeviceId(identifier);
      }
    }
    initDevice();
  }, [deviceId, setDeviceId]);

  const setupNotificationChannels = useCallback(async () => {
    if (Capacitor.getPlatform() !== "android") return;

    try {
      await PushNotifications.createChannel({
        id: "default_channel_id",
        name: "기본 알림",
        description: "기본 알림 수신",
        importance: 5,
        visibility: 1,
        vibration: true,
      });
    } catch (error) {
      console.error("Channel creation error:", error);
    }
  }, []);

  const registerPush = useCallback(async () => {
    // 웹이거나 로그인 안 되어 있으면 아무것도 안 함
    if (!Capacitor.isNativePlatform() || !isLoggedIn || !deviceId) return;

    try {
      // 리스너 등록
      await setupNotificationChannels();

      await PushNotifications.removeAllListeners();

      // 딥링크 처리
      await PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (notification) => {
          const data = notification.notification.data;
          const type: Notification["type"] = data.type;
          const { linkProps } = NOTIFICATION_CONFIG[type!];

          router.navigate({ ...linkProps });
        },
      );

      // 포그라운드 알림 처리
      await PushNotifications.addListener(
        "pushNotificationReceived",
        (notification) => {
          showToast(notification);
        },
      );

      await PushNotifications.addListener("registration", async (token) => {
        await api.post("/api/v1/notifications/tokens", {
          fcmToken: token.value,
          deviceId: deviceId,
          platform: "ANDROID",
        });
      });

      // 3. FCM 등록 시작
      await PushNotifications.register();
    } catch (error) {
      console.error("Push registration error:", error);
    }
  }, [isLoggedIn, deviceId, setupNotificationChannels, showToast]);

  return { registerPush };
}
