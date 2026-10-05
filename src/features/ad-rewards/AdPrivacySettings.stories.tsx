import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { AdPrivacySettingsView } from "./AdPrivacySettingsView";

const meta = {
  title: "광고/개인정보 설정",
  component: AdPrivacySettingsView,
  args: { visible: true, pending: false, onOpen: fn().mockName("광고 개인정보 설정 열기") },
  argTypes: {
    visible: { control: "boolean", description: "광고를 지원하는 환경에서 표시" },
    pending: { control: "boolean", description: "개인정보 설정을 불러오는 동안 클릭 차단" },
    onOpen: { control: false },
  },
  // 실제 마이페이지처럼 목록 안에 설정 항목을 표시합니다.
  decorators: [(Story) => <ul className="w-full"><Story /></ul>],
} satisfies Meta<typeof AdPrivacySettingsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "기본 표시" };
export const Pending: Story = { name: "처리 중", args: { pending: true } };
export const Unsupported: Story = { name: "미지원 · 숨김", args: { visible: false } };
