import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import type { components } from "@/generated/api-types";
import { usePushNotifications } from "@/hooks/usePushManager";
import useCoachMarkTourStore from "@/store/coachMarkTourStore";
import useModalStore from "@/store/modalStore";
import useToastStore from "@/store/toastStore";
import {
  HOME_COACH_MARK_STEPS,
  HOME_COACH_MARK_TOUR_ID,
} from "./homeCoachMarkSteps";

type Question = components["schemas"]["DailyQuestionResponseV2"] | null;

type HomeEntryPrompt = {
  id: "homeCoachMark" | "pushPermission" | "updateNotice";
  priority: number;
  shouldShow: boolean;
  show: () => void;
};

export function useHomeEntryPrompts(question: Question) {
  const { registerPush } = usePushNotifications();
  const { showModal, closeModal, isOpen: isGlobalModalOpen } = useModalStore();
  const {
    startTourOnce,
    isOpen: isCoachMarkOpen,
    isCompleted: isCoachMarkCompleted,
  } = useCoachMarkTourStore();
  const { showToast } = useToastStore();

  const hasShownPushPermissionPrompt = useRef(false);
  const hasShownUpdateNotice = useRef(false);
  const isCheckingPushPermission = useRef(false);
  const [isPushPermissionResolved, setIsPushPermissionResolved] =
    useState(false);

  useEffect(() => {
    if (!question || isGlobalModalOpen) return;

    const isHomeCoachMarkCompleted = isCoachMarkCompleted(
      HOME_COACH_MARK_TOUR_ID,
    );
    const homeCoachMarkState = {
      isOpen: isCoachMarkOpen,
      isCompleted: isHomeCoachMarkCompleted,
    };
    const pushPermissionState = {
      hasShownPrompt: hasShownPushPermissionPrompt,
      isChecking: isCheckingPushPermission,
      isResolved: isPushPermissionResolved,
      resolve: () => setIsPushPermissionResolved(true),
    };
    const updateNoticeState = {
      hasShown: hasShownUpdateNotice,
    };
    const promptState = {
      homeCoachMark: {
        ...homeCoachMarkState,
        shouldShow:
          !question.answered &&
          (!homeCoachMarkState.isCompleted || homeCoachMarkState.isOpen),
      },
      pushPermission: {
        ...pushPermissionState,
        shouldShow: !pushPermissionState.isResolved,
      },
      updateNotice: {
        ...updateNoticeState,
        shouldShow: !updateNoticeState.hasShown.current,
      },
    };

    const startCoachMark = () => {
      startTourOnce(HOME_COACH_MARK_TOUR_ID, HOME_COACH_MARK_STEPS);
    };

    const showPushPermissionModal = () => {
      if (!Capacitor.isNativePlatform()) {
        promptState.pushPermission.resolve();
        return;
      }

      if (
        promptState.pushPermission.hasShownPrompt.current ||
        promptState.pushPermission.isChecking.current
      ) {
        return;
      }

      async function checkNotificationPerm() {
        promptState.pushPermission.isChecking.current = true;
        try {
          let perm = await PushNotifications.checkPermissions();
          const state = perm.receive;
          if (state !== "prompt") {
            promptState.pushPermission.resolve();
            return;
          }

          promptState.pushPermission.hasShownPrompt.current = true;
          showModal({
            icon: () => (
              <img
                src="/mainLogo.png"
                alt="모달 아이콘"
                className="aspect-square h-[33px] p-[11px] box-content"
              />
            ),
            title: "나답으로부터 알림을 받아볼래요?",
            children: <>마이페이지에서 언제든지 설정을 변경할 수 있어요.</>,
            buttons: [
              {
                label: "다음",
                onClick: async () => {
                  closeModal();
                  try {
                    // 권한 확인 및 요청
                    perm = await PushNotifications.requestPermissions();
                    if (perm.receive === "granted") {
                      await registerPush();
                      showToast({ message: "알림 권한이 허용되었어요." });
                    } else {
                      showToast({ message: "알림 권한이 거부되었어요." });
                    }
                  } catch (error) {
                    console.error(error);
                  } finally {
                    promptState.pushPermission.resolve();
                  }
                },
              },
            ],
          });
        } finally {
          promptState.pushPermission.isChecking.current = false;
        }
      }

      checkNotificationPerm();
    };

    const showUpdateNoticeModal = () => {
      promptState.updateNotice.hasShown.current = true;
      showModal({
        icon: () => (
          <img
            src="/mainLogo.png"
            alt="모달 아이콘"
            className="aspect-square h-[33px] p-[11px] box-content"
          />
        ),
        title: "나답이 새로워졌어요",
        children: "더 편하게 기록할 수 있도록 업데이트 안내를 준비했어요.",
        buttons: [
          {
            label: "확인",
            onClick: closeModal,
          },
        ],
      });
    };

    const modalQueue: HomeEntryPrompt[] = [
      {
        id: "homeCoachMark",
        priority: 1,
        shouldShow: promptState.homeCoachMark.shouldShow,
        show: startCoachMark,
      },
      {
        id: "pushPermission",
        priority: 2,
        shouldShow: promptState.pushPermission.shouldShow,
        show: showPushPermissionModal,
      },
      {
        id: "updateNotice",
        priority: 3,
        shouldShow: promptState.updateNotice.shouldShow,
        show: showUpdateNoticeModal,
      },
    ];

    modalQueue
      .sort((a, b) => a.priority - b.priority)
      .find((prompt) => prompt.shouldShow)
      ?.show();
  }, [
    closeModal,
    isCoachMarkCompleted,
    isCoachMarkOpen,
    isGlobalModalOpen,
    isPushPermissionResolved,
    question,
    registerPush,
    showModal,
    showToast,
    startTourOnce,
  ]);
}
