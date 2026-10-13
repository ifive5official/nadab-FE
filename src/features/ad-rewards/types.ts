import type { components } from "@/generated/api-types";

// 앱의 광고 보상은 물어보기 대화권 충전에만 제공합니다.
export type AdRewardFeature = Extract<
  components["schemas"]["AdRewardSessionCreateRequest"]["feature"],
  "ASK_CHAT_TURN_CHARGE"
>;
export type AdRewardQuote = Required<components["schemas"]["AdRewardQuoteResponse"]>;
export type AdRewardSession = Required<components["schemas"]["AdRewardSessionCreateResponse"]>;
export type AdRewardStatus = Required<components["schemas"]["AdRewardSessionStatusResponse"]>;

export type AdRewardPhase =
  | "idle" | "quoting" | "offer" | "preparing" | "showing"
  | "checking" | "delayed" | "expired" | "adError" | "error" | "resuming";

export type AdRewardState = {
  phase: AdRewardPhase;
  feature?: AdRewardFeature;
  quote?: AdRewardQuote;
  session?: AdRewardSession;
  message?: string;
};
