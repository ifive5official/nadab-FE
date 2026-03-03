// 마이페이지 알림 섹션
import {
  Section,
  SectionItem,
} from "@/features/user/components/AccountSectionComponents";
import Switch from "@/components/Switch";
import { useState } from "react";
import TimePickerModal from "@/components/TimePickerModal";
import { Badge } from "@/components/Badges";
import type { components } from "@/generated/api-types";
import { formatTime } from "@/lib/formatters";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  function getSettingByGroup(group: "ACTIVITY_REMINDER" | "REPORT" | "SOCIAL") {
    return notificationSettings.find((setting) => setting.group === group)!;
  }
  return (
    <>
      <Section type="accordion" title="알림 설정">
        <SectionItem
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
                  getSettingByGroup("ACTIVITY_REMINDER").dailyWriteTime ??
                    "08:00",
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
        isOpen={isModalOpen}
        onConfirm={() => setIsModalOpen(false)}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
