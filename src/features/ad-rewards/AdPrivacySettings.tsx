import { useState } from "react";
import { Section, SectionDivider } from "@/features/user/components/AccountSectionComponents";
import useToastStore from "@/store/toastStore";
import { isAdRewardAvailable } from "./native";

// 광고 동의가 필요한 사용자가 마이페이지에서 언제든 동의 설정을 변경하게 합니다.
export function AdPrivacySettings() {
  const [pending, setPending] = useState(false);
  const { showToast } = useToastStore();
  if (!isAdRewardAvailable()) return null;

  // 현재 지역의 동의 설정이 제공되는 경우 UMP 개인정보 설정 창을 엽니다.
  async function openPrivacyOptions() {
    if (pending) return;
    setPending(true);
    try {
      const { AdMob } = await import("@capacitor-community/admob");
      const info = await AdMob.requestConsentInfo();
      if (info.privacyOptionsRequirementStatus === "REQUIRED") {
        await AdMob.showPrivacyOptionsForm();
      } else {
        showToast({ message: "현재 변경할 광고 동의 설정이 없어요." });
      }
    } catch {
      showToast({ message: "광고 동의 설정을 불러오지 못했어요.", variant: "error" });
    } finally {
      setPending(false);
    }
  }

  return <>
    <SectionDivider />
    <Section title="광고">
      <button type="button" disabled={pending} onClick={() => void openPrivacyOptions()} className="py-padding-y-xs text-caption-l">
        광고 개인정보 설정
      </button>
    </Section>
  </>;
}
