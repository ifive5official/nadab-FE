import { describe, expect, it } from "vitest";
import {
  getAskChatAnswerFailureMessage,
  isAskChatSessionReadOnly,
} from "./session";

describe("isAskChatSessionReadOnly", () => {
  it("종료된 세션은 읽기 전용으로 판단한다", () => {
    expect(isAskChatSessionReadOnly({ status: "ENDED" })).toBe(true);
  });

  it("최대 성공 답변 횟수에 도달하면 읽기 전용으로 판단한다", () => {
    expect(
      isAskChatSessionReadOnly({
        status: "ACTIVE",
        answeredTurnCount: 15,
        maxTurnCount: 15,
      }),
    ).toBe(true);
  });

  it("활성 세션에 대화 횟수가 남아 있으면 질문을 허용한다", () => {
    expect(
      isAskChatSessionReadOnly({
        status: "ACTIVE",
        answeredTurnCount: 14,
        maxTurnCount: 15,
      }),
    ).toBe(false);
  });
});

describe("getAskChatAnswerFailureMessage", () => {
  it("실패 응답의 서버 안내 문구를 반환한다", () => {
    expect(
      getAskChatAnswerFailureMessage({
        success: false,
        message: "잠시 후 다시 시도해주세요.",
      }),
    ).toBe("잠시 후 다시 시도해주세요.");
  });

  it("성공 응답에는 실패 문구를 반환하지 않는다", () => {
    expect(getAskChatAnswerFailureMessage({ success: true })).toBeNull();
  });
});
