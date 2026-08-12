import { describe, expect, it } from "vitest";
import { canAccessAskChat, getAskChatRequiredRecordCount } from "./access";

describe("물어보기 이용 조건", () => {
  it("기록이 없으면 20개가 더 필요하다", () => {
    expect(getAskChatRequiredRecordCount()).toBe(20);
  });

  it("기록 수만큼 남은 필요 개수를 차감한다", () => {
    expect(getAskChatRequiredRecordCount(13)).toBe(7);
  });

  it("기록이 20개 이상이면 물어보기를 허용한다", () => {
    expect(canAccessAskChat(20)).toBe(true);
    expect(canAccessAskChat(25)).toBe(true);
    expect(getAskChatRequiredRecordCount(25)).toBe(0);
  });
});
