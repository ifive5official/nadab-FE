import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/axios";
import { createAdRewardSession, getAdRewardQuote, getAdRewardSessionStatus } from "./api";

vi.mock("@/lib/axios", () => ({ api: { get: vi.fn(), post: vi.fn() } }));

describe("광고 보상 응답 검증", () => {
  beforeEach(() => vi.resetAllMocks());

  it("모든 기능에 대해 서버 부족분을 반환한다", async () => {
    for (const feature of ["PDF_REPORT_ONLY", "PDF_ANSWER_ONLY", "PDF_REPORT_AND_ANSWER", "ASK_CHAT_TURN_CHARGE"] as const) {
      const quote = { feature, crystalCost: 100, balance: 30, requiredCrystal: 70 };
      vi.mocked(api.get).mockResolvedValue({ data: { data: quote } });
      expect(await getAdRewardQuote(feature)).toEqual(quote);
      expect(api.get).toHaveBeenLastCalledWith("/api/v1/ad-rewards/quote", expect.objectContaining({ params: { feature } }));
    }
  });

  it.each([undefined, {}, { feature: "PDF_REPORT_ONLY", crystalCost: 50, balance: 10 }, { feature: "PDF_REPORT_ONLY", crystalCost: 50, balance: 10, requiredCrystal: 0 }])("불완전한 부족분을 광고 불필요로 간주하지 않는다: %j", async (data) => {
    vi.mocked(api.get).mockResolvedValue({ data: { data } });
    await expect(getAdRewardQuote("PDF_REPORT_ONLY")).rejects.toThrow();
  });

  it.each([{}, { sessionKey: "", rewardAmount: 10, expiresAt: "2099-01-01" }, { sessionKey: "key", rewardAmount: 10, expiresAt: "invalid" }])("유효하지 않은 세션으로 광고를 표시하지 않는다: %j", async (data) => {
    vi.mocked(api.post).mockResolvedValue({ data: { data } });
    await expect(createAdRewardSession("ASK_CHAT_TURN_CHARGE")).rejects.toThrow();
  });

  it.each([{}, { status: "REWARDED" }, { status: "UNKNOWN", rewardAmount: 1 }])("누락된 지급 상태를 성공으로 간주하지 않는다: %j", async (data) => {
    vi.mocked(api.get).mockResolvedValue({ data: { data } });
    await expect(getAdRewardSessionStatus("key")).rejects.toThrow();
  });
});
