import { useCallback, useEffect } from "react";
import { PushNotifications } from "@capacitor/push-notifications";
import useAuthStore from "@/store/authStore";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import { api } from "@/lib/axios";

export function usePushNotifications() {
  const { accessToken: isLoggedIn, deviceId, setDeviceId } = useAuthStore();

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
        description: "일반적인 서비스 알림을 수신합니다.",
        importance: 5,
        visibility: 1,
        vibration: true,
      });
      console.log("Push Channel Created");
    } catch (error) {
      console.error("Channel creation error:", error);
    }
  }, []);

  const registerPush = useCallback(async () => {
    // 웹이거나 로그인 안 되어 있으면 아무것도 안 함
    if (!Capacitor.isNativePlatform() || !isLoggedIn || !deviceId) return;

    try {
      // 1. 권한 확인 및 요청
      let perm = await PushNotifications.checkPermissions();
      if (perm.receive === "prompt") {
        perm = await PushNotifications.requestPermissions();
      }
      if (perm.receive !== "granted") return;

      // 2. 리스너 등록
      await setupNotificationChannels();

      await PushNotifications.removeAllListeners();

      await PushNotifications.addListener("registration", async (token) => {
        await api.post("/api/v1/notifications/tokens", {
          fcmToken: token.value,
          deviceId: deviceId,
          platform: "ANDROID",
        });
        console.log("Push Token Registered");
      });

      // 3. FCM 등록 시작
      await PushNotifications.register();
    } catch (error) {
      console.error("Push registration error:", error);
    }
  }, [isLoggedIn, deviceId]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !isLoggedIn || !deviceId) return;
    registerPush();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [registerPush, isLoggedIn, deviceId]); // 로그인 상태가 바뀔 때마다 실행
}
