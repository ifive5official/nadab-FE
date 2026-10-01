import type { ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import { api } from "@/lib/axios";
import type { AdRewardFeature, AdRewardQuote, AdRewardSession, AdRewardStatus } from "./types";

// 누락되거나 잘못된 보상 응답을 성공으로 취급하지 않도록 검증합니다.
function requireValid(condition: unknown): asserts condition {
  if (!condition) throw new Error("광고 보상 정보를 확인할 수 없어요. 다시 시도해 주세요.");
}

// 서버에서 전달한 크리스탈 개수가 유효한 정수인지 확인합니다.
function isAmount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

// 세션을 만들지 않고 선택 기능의 비용과 부족분을 조회합니다.
export async function getAdRewardQuote(feature: AdRewardFeature, signal?: AbortSignal): Promise<AdRewardQuote> {
  const { data: response } = await api.get<ApiResponse<components["schemas"]["AdRewardQuoteResponse"]>>(
    "/api/v1/ad-rewards/quote", { params: { feature }, signal, timeout: 10000 },
  );
  const data = response.data;
  requireValid(data && data.feature === feature && isAmount(data.crystalCost) && isAmount(data.balance) && isAmount(data.requiredCrystal));
  requireValid(data.requiredCrystal === Math.max(0, data.crystalCost! - data.balance!));
  return data as AdRewardQuote;
}

// 광고 시청을 선택한 시점에 서버가 확정한 지급 세션을 발급합니다.
export async function createAdRewardSession(feature: AdRewardFeature, signal?: AbortSignal): Promise<AdRewardSession> {
  const { data: response } = await api.post<ApiResponse<components["schemas"]["AdRewardSessionCreateResponse"]>>(
    "/api/v1/ad-rewards/sessions", { feature }, { signal, timeout: 10000 },
  );
  const data = response.data;
  requireValid(data && typeof data.sessionKey === "string" && data.sessionKey.trim() && isAmount(data.rewardAmount) && data.rewardAmount > 0 && typeof data.expiresAt === "string" && Number.isFinite(Date.parse(data.expiresAt)));
  return data as AdRewardSession;
}

// 광고 SDK 콜백 대신 서버 검증으로 확정된 지급 상태를 조회합니다.
export async function getAdRewardSessionStatus(sessionKey: string, signal?: AbortSignal): Promise<AdRewardStatus> {
  const { data: response } = await api.get<ApiResponse<components["schemas"]["AdRewardSessionStatusResponse"]>>(
    `/api/v1/ad-rewards/sessions/${encodeURIComponent(sessionKey)}`, { signal, timeout: 10000 },
  );
  const data = response.data;
  requireValid(data && ["PENDING", "REWARDED", "EXPIRED"].includes(data.status ?? "") && isAmount(data.rewardAmount));
  return data as AdRewardStatus;
}
