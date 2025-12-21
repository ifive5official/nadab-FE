import { Section, SectionItem } from "./AccountSectionComponents";
import Switch from "@/components/Switch";

type Props = {
  isDarkMode: boolean;
  onToggle: () => void;
};

export default function ThemeSection({ isDarkMode, onToggle }: Props) {
  return (
    <Section title="테마">
      <SectionItem
        title="다크 모드"
        rightElement={<Switch isOn={isDarkMode} onClick={onToggle} />}
      />
    </Section>
  );
}
