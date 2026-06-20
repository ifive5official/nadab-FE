import { useCallback, useEffect, useRef, useState } from "react";
import { App } from "@capacitor/app";
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
type LatestVersion = components["schemas"]["HomeLatestVersionResponse"];
type PlatformVersion = components["schemas"]["HomePlatformVersionResponse"];

type HomeEntryPromptsParams = {
  question: Question;
  latestVersion?: LatestVersion;
};

type HomeEntryPrompt = {
  id: "homeCoachMark" | "pushPermission" | "updateNotice";
  priority: number;
  shouldShow: boolean;
  show: () => void;
};

type UpdateNoticeModalState = {
  isOpen: boolean;
  data?: PlatformVersion;
  isOutdated: boolean;
  storeUrl?: string;
};

const UPDATE_NOTICE_SHOWN_SESSION_KEY = "home:update-notice:shown";

function getUpdateNoticeKey(updateNotice: PlatformVersion) {
  return String(updateNotice.appVersionId ?? updateNotice.version);
}

function hasShownUpdateNotice(updateNotice?: PlatformVersion) {
  if (!updateNotice) return false;

  try {
    return (
      sessionStorage.getItem(UPDATE_NOTICE_SHOWN_SESSION_KEY) ===
      getUpdateNoticeKey(updateNotice)
    );
  } catch {
    return false;
  }
}

function markUpdateNoticeAsShown(updateNotice: PlatformVersion) {
  try {
    sessionStorage.setItem(
      UPDATE_NOTICE_SHOWN_SESSION_KEY,
      getUpdateNoticeKey(updateNotice),
    );
  } catch {
    // sessionStorage 접근이 불가능한 환경에서는 서버 dismissed 값만 사용합니다.
  }
}

function getCurrentPlatformVersion(
  latestVersion?: LatestVersion,
): PlatformVersion | undefined {
  const platform = Capacitor.getPlatform();
  if (platform === "ios") return latestVersion?.ios;
  if (platform === "android") return latestVersion?.android;

  // TODO: 웹에서 업데이트 모달을 빠르게 확인하기 위한 임시 테스트 분기입니다.
  // 테스트가 끝나면 아래 fallback을 제거하고 web에서는 undefined를 반환하게 되돌려주세요.
  if (platform === "web") return latestVersion?.ios ?? latestVersion?.android;

  return undefined;
}

async function getCurrentAppVersion() {
  // TODO: 웹에서 outdated 업데이트 모달을 빠르게 확인하기 위한 임시 테스트 분기입니다.
  // 테스트가 끝나면 아래 web 버전 fallback을 제거하고 native App.getInfo()만 사용하게 되돌려주세요.
  if (Capacitor.getPlatform() === "web") return "0.0.0";

  if (!Capacitor.isNativePlatform()) return undefined;

  try {
    const appInfo = await App.getInfo();
    return appInfo.version;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

function parseVersion(version?: string) {
  return (
    version
      ?.split(".")
      .map((part) => Number.parseInt(part, 10))
      .map((part) => (Number.isNaN(part) ? 0 : part)) ?? []
  );
}

function isVersionBehind(currentVersion?: string, latestVersion?: string) {
  if (!currentVersion || !latestVersion) return false;

  const currentParts = parseVersion(currentVersion);
  const latestParts = parseVersion(latestVersion);
  const length = Math.max(currentParts.length, latestParts.length);

  for (let index = 0; index < length; index += 1) {
    const currentPart = currentParts[index] ?? 0;
    const latestPart = latestParts[index] ?? 0;

    if (currentPart < latestPart) return true;
    if (currentPart > latestPart) return false;
  }

  return false;
}

function getStoreUrl() {
  const platform = Capacitor.getPlatform();
  if (platform === "ios") {
    return (
      import.meta.env.VITE_IOS_APP_STORE_URL ??
      "https://apps.apple.com/app/id6761776437"
    );
  }
  if (platform === "android") {
    return (
      import.meta.env.VITE_ANDROID_PLAY_STORE_URL ??
      "https://play.google.com/store/apps/details?id=com.nadab.app"
    );
  }
  // TODO: 웹에서 outdated 업데이트 모달 이동 버튼을 확인하기 위한 임시 테스트 분기입니다.
  // 테스트가 끝나면 아래 web fallback을 제거하고 web에서는 undefined를 반환하게 되돌려주세요.
  if (platform === "web") {
    return (
      import.meta.env.VITE_IOS_APP_STORE_URL ??
      import.meta.env.VITE_ANDROID_PLAY_STORE_URL ??
      "https://apps.apple.com/app/id6761776437"
    );
  }
  return undefined;
}

export function useHomeEntryPrompts({
  question,
  latestVersion,
}: HomeEntryPromptsParams) {
  const { registerPush } = usePushNotifications();
  const { showModal, closeModal, isOpen: isGlobalModalOpen } = useModalStore();
  const {
    startTourOnce,
    isOpen: isCoachMarkOpen,
    isCompleted: isCoachMarkCompleted,
  } = useCoachMarkTourStore();
  const { showToast } = useToastStore();

  const hasShownPushPermissionPrompt = useRef(false);
  const isCheckingPushPermission = useRef(false);
  const [isPushPermissionResolved, setIsPushPermissionResolved] =
    useState(false);
  const [updateNoticeModal, setUpdateNoticeModal] =
    useState<UpdateNoticeModalState>({
      isOpen: false,
      isOutdated: false,
    });

  const closeUpdateNoticeModal = useCallback(() => {
    setUpdateNoticeModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  useEffect(() => {
    if (!question || isGlobalModalOpen) return;

    const updateNotice = getCurrentPlatformVersion(latestVersion);
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
      data: updateNotice,
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
        shouldShow:
          Boolean(updateNoticeState.data) &&
          !updateNoticeState.data?.dismissed &&
          !hasShownUpdateNotice(updateNoticeState.data),
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
      const updateNoticeData = promptState.updateNotice.data;
      if (!updateNoticeData) return;

      markUpdateNoticeAsShown(updateNoticeData);
      void getCurrentAppVersion().then((currentAppVersion) => {
        const isOutdated = isVersionBehind(
          currentAppVersion,
          updateNoticeData.version,
        );

        setUpdateNoticeModal({
          isOpen: true,
          data: updateNoticeData,
          isOutdated,
          storeUrl: getStoreUrl(),
        });
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
    latestVersion,
    question,
    registerPush,
    showModal,
    showToast,
    startTourOnce,
  ]);

  return {
    updateNoticeModal: {
      ...updateNoticeModal,
      onClose: closeUpdateNoticeModal,
    },
  };
}
