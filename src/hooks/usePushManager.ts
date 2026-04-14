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
import { FCM } from "@capacitor-community/fcm";
import { App } from "@capacitor/app";
import { Badge } from "@capawesome/capacitor-badge";
import { useReadNotificationMutation } from "@/features/notifications/useReadNotification";

export function usePushNotifications() {
  const { accessToken: isLoggedIn, deviceId, setDeviceId } = useAuthStore();
  const { showToast } = usePushToastStore();
  const readNotificationMutation = useReadNotificationMutation();

  // ios에서 앱이 활성화될 때마다 배지 초기화
  useEffect(() => {
    if (!(Capacitor.getPlatform() === "ios")) return;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    let listener: any;

    const setupListener = async () => {
      listener = await App.addListener(
        "appStateChange",
        async ({ isActive }) => {
          if (isActive) {
            await Badge.set({ count: 0 });
            await PushNotifications.removeAllDeliveredNotifications();
          }
        },
      );
    };

    setupListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, []);

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
    try {
      await PushNotifications.createChannel({
        id: "default_push",
        name: "기본 알림",
        description: "기본 알림 수신",
        importance: 5,
        visibility: 1,
        vibration: true,
        sound: "default",
      });
    } catch (error) {
      console.error("Channel creation error:", error);
    }
  }, []);

  const registerPush = useCallback(async () => {
    // 웹이거나 로그인 안 되어 있으면 아무것도 안 함
    if (!Capacitor.isNativePlatform() || !isLoggedIn || !deviceId) return;

    const platform = Capacitor.getPlatform().toUpperCase();

    try {
      // 리스너 등록
      if (platform === "ANDROID") {
        await setupNotificationChannels();
      }
      await PushNotifications.removeAllListeners();

      // 딥링크 처리
      await PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (notification) => {
          const data = notification.notification.data;
          const notificationId = data.notificationId;
          if (notificationId && notificationId !== "null") {
            readNotificationMutation.mutate({
              notificationId: notificationId,
            });
          }
          const type: Notification["type"] = data.type;
          const { linkProps } = NOTIFICATION_CONFIG[type!];

          router.navigate({ ...linkProps });
        },
      );

      // 포그라운드 알림 처리
      await PushNotifications.addListener(
        "pushNotificationReceived",
        async (notification) => {
          showToast(notification);
          // 앱을 보고 있는 중에는 배지가 쌓일 필요가 없으므로 바로 지움
          await Badge.set({ count: 0 });
          await PushNotifications.removeAllDeliveredNotifications();
        },
      );

      await PushNotifications.addListener("registration", async (token) => {
        let fcmToken = token.value;

        if (platform === "IOS") {
          const res = await FCM.getToken();
          fcmToken = res.token;
        }
        await api.post("/api/v1/notifications/tokens", {
          fcmToken: fcmToken,
          deviceId: deviceId,
          platform: platform,
        });
      });

      // 3. FCM 등록 시작
      await PushNotifications.register();
    } catch (error) {
      console.error("Push registration error:", error);
    }
  }, [
    isLoggedIn,
    deviceId,
    setupNotificationChannels,
    showToast,
    readNotificationMutation,
  ]);

  async function unregisterPush() {
    if (!Capacitor.isNativePlatform() || !deviceId) return;
    const platform = Capacitor.getPlatform().toUpperCase();

    const perm = await PushNotifications.checkPermissions();
    if (perm.receive === "granted") {
      await api.delete(`/api/v1/notifications/tokens/${deviceId}/${platform}`);
      await PushNotifications.removeAllListeners();
    }
  }

  return { registerPush, unregisterPush };
}
