import { NOTIFICATION_CONFIG } from "@/features/notifications/notificationConfigs";
import InlineButton from "./InlineButton";
import { useNavigate } from "@tanstack/react-router";
import { BannerCloseIcon } from "./Icons";
import usePushToastStore from "@/store/pushToastStore";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useReadNotificationMutation } from "@/features/notifications/useReadNotification";

// 포그라운드 알림용 토스트
export default function PushToast() {
  const { isOpen, notification, closeToast } = usePushToastStore();
  const readNotificationMutation = useReadNotificationMutation();
  const navigate = useNavigate();

  if (!notification) return null;
  const type = notification.data.type;
  const notificationId = notification.data.notificationId;
  const config = NOTIFICATION_CONFIG[type!];
  if (!config) return null; // undefined 참조 에러 땜빵
  return createPortal(
    <AnimatePresence>
      {isOpen && notification && (
        <motion.div
          className="absolute z-50 w-full bg-surface-base"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <div className="w-full bg-brand-primary-alpha-10 px-padding-x-m py-padding-y-m flex items-center">
            <img
              src={config.inboxIconSrc}
              alt="알림 아이콘"
              className="aspect-square h-[30px]"
            />
            <p className="text-label-m ml-gap-x-xs mr-margin-x-xs">
              {notification.data.inboxMessage}
            </p>
            <InlineButton
              className="ml-auto border border-brand-primary shrink-0 bg-button-tertiary-bg-default!"
              variant="secondary"
              onClick={() => {
                if (notificationId && notificationId !== "null") {
                  readNotificationMutation.mutate({
                    notificationId: Number(notificationId),
                  });
                }
                navigate({ ...config.linkProps });
              }}
            >
              바로가기
            </InlineButton>
            <button
              className="text-[#ADA5FF] ml-padding-x-xs"
              onClick={closeToast}
            >
              <BannerCloseIcon />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById("push-root")!,
  );
}
