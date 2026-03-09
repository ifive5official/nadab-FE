// 마이페이지 알림 섹션
// 앱 환경에서만 보임
import {
  Section,
  SectionItem,
} from "@/features/user/components/AccountSectionComponents";
import Switch from "@/components/Switch";
import { useEffect, useState } from "react";
import TimePickerModal from "@/components/TimePickerModal";
import { Badge } from "@/components/Badges";
import type { components } from "@/generated/api-types";
import { formatTime } from "@/lib/formatters";
import { PushNotifications } from "@capacitor/push-notifications";
import useToastStore from "@/store/toastStore";

type notificationSetting = components["schemas"]["NotificationSettingResponse"];
type notificationSettingReq =
  components["schemas"]["UpdateNotificationSettingRequest"];

type Props = {
  notificationSettings: notificationSetting[];
  onChange: (newSetting: notificationSettingReq) => void;
};

export default function NotificationSection({
  notificationSettings,
  onChange,
}: Props) {
  // 알림 권한 체크
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  useEffect(() => {
    async function checkNotificationPerm() {
      const perm = await PushNotifications.checkPermissions();
      setHasPermission(perm.receive === "granted");
    }
    checkNotificationPerm();
  }, []);

  const [isSectionOpen, setIsSectionOpen] = useState(false);

  const { showToast } = useToastStore();
  const [isModalOpen, setIsModalOpen] = useState(false); // 알림 시간 선택 모달
  function getSettingByGroup(group: "ACTIVITY_REMINDER" | "REPORT" | "SOCIAL") {
    return notificationSettings.find((setting) => setting.group === group)!;
  }
  return (
    <>
      <Section
        type="accordion"
        isOpen={isSectionOpen}
        onToggleAccordion={async () => {
          if (hasPermission) {
            setIsSectionOpen((prev) => !prev);
          } else {
            // 알림 권한이 꺼져 있다면 알림 섹션 아코디언 열지 않음
            try {
              let perm = await PushNotifications.checkPermissions();
              if (perm.receive === "prompt") {
                perm = await PushNotifications.requestPermissions();
              }
              if (perm.receive === "granted") {
                setHasPermission(true);
                setIsSectionOpen(true);
              } else {
                // 완전히 거절(denied)된 경우
                showToast({ message: "설정에서 알림 권한을 허용해 주세요." });
              }
            } catch (error) {
              console.error(error);
            }
          }
        }}
        title="알림 설정"
      >
        <SectionItem
          disabled={!getSettingByGroup("ACTIVITY_REMINDER").enabled}
          title="활동 알림"
          rightElement={
            <div className="flex gap-gap-x-m">
              <Badge
                isActive={
                  getSettingByGroup("ACTIVITY_REMINDER").enabled ?? false
                }
                onClick={() => setIsModalOpen(true)}
              >
                {formatTime(
                  getSettingByGroup("ACTIVITY_REMINDER").dailyWriteTime!,
                )}
              </Badge>
              <Switch
                isOn={getSettingByGroup("ACTIVITY_REMINDER").enabled ?? false}
                onClick={() => {
                  onChange({
                    group: "ACTIVITY_REMINDER",
                    enabled: !getSettingByGroup("ACTIVITY_REMINDER").enabled,
                  });
                }}
              />
            </div>
          }
        />
        <SectionItem
          disabled={!getSettingByGroup("REPORT").enabled}
          title="리포트 알림"
          rightElement={
            <Switch
              isOn={getSettingByGroup("REPORT").enabled ?? false}
              onClick={() => {
                onChange({
                  group: "REPORT",
                  enabled: !getSettingByGroup("REPORT").enabled,
                });
              }}
            />
          }
        />
        <SectionItem
          disabled={!getSettingByGroup("SOCIAL").enabled}
          title="소셜 알림"
          rightElement={
            <Switch
              isOn={getSettingByGroup("SOCIAL").enabled ?? false}
              onClick={() => {
                onChange({
                  group: "SOCIAL",
                  enabled: !getSettingByGroup("SOCIAL").enabled,
                });
              }}
            />
          }
        />
      </Section>
      <TimePickerModal
        initialTime={formatTime(
          getSettingByGroup("ACTIVITY_REMINDER").dailyWriteTime!,
        )}
        isOpen={isModalOpen}
        onConfirm={(time: string) => {
          onChange({
            group: "ACTIVITY_REMINDER",
            enabled: true,
            dailyWriteTime: time,
          });
          setIsModalOpen(false);
        }}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
