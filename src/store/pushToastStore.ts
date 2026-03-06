// 포그라운드 알림 토스트를 관리하는 store
import { create } from "zustand";
import createSelectors from "./createSelectors";
import type { Notification } from "@/features/notifications/notificationConfigs";
import type { PushNotificationSchema } from "@capacitor/push-notifications";

type PushData = {
  unreadCount: number;
  targetId: number;
  type: Notification["type"];
  inboxMessage: string;
};

export interface PushNotification extends PushNotificationSchema {
  data: PushData;
}

type State = {
  isOpen: boolean;
  notification: PushNotification | null;
};

type Action = {
  showToast: (notification: PushNotification) => void;
  closeToast: () => void;
};

const usePushToastStoreBase = create<State & Action>((set, get) => ({
  isOpen: false,
  notification: null,
  showToast: (notification) => {
    set({ isOpen: true, notification });

    setTimeout(() => {
      get().closeToast();
    }, 3000);
  },
  closeToast: () => set({ isOpen: false }),
}));

const usePushToastStore = createSelectors(usePushToastStoreBase);

export default usePushToastStore;
