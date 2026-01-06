// 마이페이지 알림 섹션
import {
  Section,
  SectionItem,
} from "@/features/user/components/AccountSectionComponents";
import Switch from "@/components/Switch";
import { useState } from "react";
import TimePickerModal from "@/components/TimePickerModal";
import { Badge } from "@/components/Badges";

type Props = {
  isOn: boolean;
  onToggle: (prev: boolean) => void;
};

export default function NotificationSection({ isOn, onToggle }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Section title="알림 설정">
        <SectionItem
          title="알림"
          rightElement={
            <Switch
              isOn={isOn}
              onClick={() => {
                onToggle(isOn);
              }}
            />
          }
        />
        <SectionItem
          title="알림 시간"
          rightElement={<Badge isActive={isOn}>08 : 00 AM</Badge>}
          disabled={!isOn}
          onClick={() => setIsModalOpen(true)}
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
