import type { components } from "@/generated/api-types";

export type AdRewardFeature =
  components["schemas"]["AdRewardSessionCreateRequest"]["feature"];
export type AdRewardQuote = Required<components["schemas"]["AdRewardQuoteResponse"]>;
export type AdRewardSession = Required<components["schemas"]["AdRewardSessionCreateResponse"]>;
export type AdRewardStatus = Required<components["schemas"]["AdRewardSessionStatusResponse"]>;

export const PDF_AD_REWARD_FEATURES = {
  REPORT_ONLY: "PDF_REPORT_ONLY",
  ANSWER_ONLY: "PDF_ANSWER_ONLY",
  REPORT_AND_ANSWER: "PDF_REPORT_AND_ANSWER",
} as const satisfies Record<components["schemas"]["PdfExportStartRequest"]["type"], AdRewardFeature>;

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
