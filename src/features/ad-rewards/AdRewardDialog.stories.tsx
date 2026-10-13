import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { AdRewardDialogView, type AdRewardDialogViewProps } from "./AdRewardDialogView";
import type { AdRewardFeature, AdRewardPhase } from "./types";

type Args = Omit<AdRewardDialogViewProps, "state"> & {
  phase: AdRewardPhase;
  feature: AdRewardFeature;
  crystalCost: number;
  balance: number;
  requiredCrystal: number;
  message: string;
};

// Controls의 개별 값을 실제 화면에서 사용하는 상태로 조합합니다. 서버와 SDK는 호출하지 않습니다.
function RewardPreview({ phase, feature, crystalCost, balance, requiredCrystal, message, ...actions }: Args) {
  return <AdRewardDialogView
    state={{ phase, feature, quote: { feature, crystalCost, balance, requiredCrystal }, message }}
    {...actions}
  />;
}

const meta = {
  title: "광고/보상 팝업",
  component: RewardPreview,
  args: {
    phase: "offer",
    feature: "ASK_CHAT_TURN_CHARGE",
    crystalCost: 200,
    balance: 30,
    requiredCrystal: 170,
    message: "",
    onCancel: fn().mockName("취소"),
    onWatch: fn().mockName("광고 보기"),
    onCheck: fn().mockName("다시 확인"),
  },
  argTypes: {
    phase: { control: "select", options: ["idle", "quoting", "offer", "preparing", "showing", "checking", "delayed", "expired", "adError", "error", "resuming"], description: "광고 흐름의 화면 상태" },
    feature: { control: false, description: "물어보기 대화권 충전" },
    crystalCost: { control: { type: "number", min: 0 }, description: "기능 비용" },
    balance: { control: { type: "number", min: 0 }, description: "보유 크리스탈" },
    requiredCrystal: { control: { type: "number", min: 0 }, description: "부족한 크리스탈" },
    message: { control: "text", description: "추가 안내·오류 문구" },
    onCancel: { control: false },
    onWatch: { control: false },
    onCheck: { control: false },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AskCharge: Story = { name: "부족 안내 · 대화권 충전" };
export const Quoting: Story = { name: "진행 · 잔액 조회", args: { phase: "quoting" } };
export const Preparing: Story = { name: "진행 · 광고 준비", args: { phase: "preparing" } };
export const Showing: Story = { name: "진행 · 광고 시청", args: { phase: "showing" } };
export const Checking: Story = { name: "진행 · 보상 확인", args: { phase: "checking" } };
export const Resuming: Story = { name: "진행 · 후속 기능 실행", args: { phase: "resuming" } };
export const Delayed: Story = { name: "예외 · 지급 지연", args: { phase: "delayed" } };
export const Expired: Story = { name: "예외 · 세션 만료", args: { phase: "expired" } };
export const AdError: Story = { name: "예외 · 광고 실패", args: { phase: "adError", message: "광고를 준비하지 못했어요. 잠시 후 다시 시도해 주세요." } };
export const Error: Story = { name: "예외 · 일반 오류", args: { phase: "error", message: "지급 상태를 확인하지 못했어요. 잠시 후 다시 시도해 주세요." } };
export const Hidden: Story = { name: "경계 · 숨김", args: { phase: "idle" } };
export const LongMessage: Story = { name: "경계 · 긴 오류 문구", args: { phase: "error", message: "네트워크 연결이 불안정해 보상 지급 상태를 확인하지 못했어요. 연결 상태를 확인한 뒤 잠시 후 다시 시도해 주세요. 이미 시청한 광고의 보상은 서버에서 확인 중이며, 크리스탈 잔액에 반영되기까지 시간이 걸릴 수 있어요." } };
export const LargeAmounts: Story = { name: "경계 · 큰 금액", args: { crystalCost: 1000000, balance: 300000, requiredCrystal: 700000 } };
