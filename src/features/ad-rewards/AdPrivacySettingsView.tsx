import { Section, SectionDivider } from "@/features/user/components/AccountSectionComponents";

export type AdPrivacySettingsViewProps = {
  visible: boolean;
  pending: boolean;
  onOpen: () => void;
};

// SDK에 의존하지 않고 광고 개인정보 설정 항목의 표시·대기 상태를 보여줍니다.
export function AdPrivacySettingsView({ visible, pending, onOpen }: AdPrivacySettingsViewProps) {
  if (!visible) return null;

  return <>
    <SectionDivider />
    <Section title="광고">
      <button type="button" disabled={pending} onClick={onOpen} className="py-padding-y-xs text-caption-l">
        광고 개인정보 설정
      </button>
    </Section>
  </>;
}
