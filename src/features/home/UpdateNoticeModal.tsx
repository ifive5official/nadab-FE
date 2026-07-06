import { useEffect, useState } from "react";
import { Browser } from "@capacitor/browser";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import { AppIcon } from "@/components/AppIcon";
import BlockButton from "@/components/BlockButton";
import CheckBox from "@/components/Checkbox";
import type { components } from "@/generated/api-types";
import { useDismissHomeVersionMutation } from "./useDismissHomeVersionMutation";

type UpdateNoticeData = components["schemas"]["HomePlatformVersionResponse"];

type Props = {
  isOpen: boolean;
  data?: UpdateNoticeData;
  isOutdated: boolean;
  storeUrl?: string;
  onClose: () => void;
};

export default function UpdateNoticeModal({
  isOpen,
  data,
  isOutdated,
  storeUrl,
  onClose,
}: Props) {
  const [dismissed, setDismissed] = useState(false);
  const dismissHomeVersionMutation = useDismissHomeVersionMutation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const closeModal = () => {
    setDismissed(false);
    onClose();
  };

  const dismissHomeVersion = (onSuccess: () => void) => {
    const shouldDismissHomeVersion = !isOutdated || dismissed;

    if (!shouldDismissHomeVersion || !data?.appVersionId) {
      onSuccess();
      return;
    }

    dismissHomeVersionMutation.mutate(
      { appVersionId: data.appVersionId },
      {
        onSuccess,
      },
    );
  };

  const handleClose = () => {
    dismissHomeVersion(closeModal);
  };

  const handleUpdate = () => {
    dismissHomeVersion(async () => {
      if (storeUrl) {
        await Browser.open({ url: storeUrl });
      }
      closeModal();
    });
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && data && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="z-40 fixed inset-0 bg-neutral-dark-50"
          />
          <motion.div
            className="z-50 fixed top-1/2 -translate-y-1/2 inset-x-padding-x-m sm:mx-auto sm:w-[412px] flex flex-col bg-surface-base dark:bg-surface-layer-2 shadow-3 border border-border-base rounded-2xl text-text-primary px-padding-x-xl py-padding-y-xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="mb-gap-y-l flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-full bg-surface-layer-1">
                <AppIcon name="notice-filled" color="primary" size={24} />
              </div>
              <button
                type="button"
                aria-label="업데이트 알림 닫기"
                onClick={handleClose}
                disabled={dismissHomeVersionMutation.isPending}
                className="flex size-6 items-center justify-center text-icon-muted"
              >
                <AppIcon name="close-big" color="current" size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-gap-y-xs">
              <p className="text-caption-m text-text-primary">
                {data.version ? `v${data.version} 업데이트` : "업데이트"}
              </p>
              <p className="text-label-l text-text-primary whitespace-pre-line">
                {data.summary ?? "나답이 새로워졌어요."}
              </p>
            </div>

            {data.items && data.items.length > 0 && (
              <ul className="mt-gap-y-l flex max-h-[min(320px,40dvh)] flex-col gap-gap-y-m overflow-y-auto pr-1">
                {data.items.map((item, index) => (
                  <li
                    key={`${item.title ?? "update"}-${index}`}
                    className="flex flex-col gap-gap-y-xs rounded-lg border border-border-base bg-surface-layer-1 px-padding-x-m py-padding-y-m"
                  >
                    {item.title && (
                      <p className="text-label-m text-text-secondary">
                        {item.title}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-body-2 text-text-primary">
                        {item.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-gap-y-l flex flex-col gap-gap-y-s">
              {isOutdated ? (
                <>
                  <BlockButton
                    onClick={handleUpdate}
                    disabled={!storeUrl}
                    isLoading={dismissHomeVersionMutation.isPending}
                  >
                    업데이트 하러 갈래요.
                  </BlockButton>
                  <CheckBox
                    boxSize="s"
                    textSize="text-button-3"
                    checked={dismissed}
                    onCheck={() => setDismissed((prev) => !prev)}
                    label="다시 보고 싶지 않아요."
                    className="justify-center"
                  />
                </>
              ) : (
                <BlockButton onClick={handleClose}>확인했어요.</BlockButton>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("modal-root")!,
  );
}
