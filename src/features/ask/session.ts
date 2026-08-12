import type { components } from "@/generated/api-types";

type AskChatSession = components["schemas"]["AskChatSessionResponse"];
type AskChatHistoryDetail =
  components["schemas"]["AskChatHistoryDetailResponse"];
type AskChatAnswerGeneration =
  components["schemas"]["AskChatAnswerGenerationResponse"];

// 세션 상태와 성공 답변 횟수를 함께 확인해 추가 질문 가능 여부를 판단합니다.
export function isAskChatSessionReadOnly(
  session?: AskChatSession | AskChatHistoryDetail,
) {
  if (!session) return false;
  if ("readOnly" in session && session.readOnly) return true;

  const maxTurnCount =
    "maxTurnCount" in session ? (session.maxTurnCount ?? 15) : 15;
  return (
    session.status === "ENDED" ||
    (session.answeredTurnCount ?? 0) >= maxTurnCount
  );
}

// AI 답변 생성 실패 시 서버 안내 문구를 우선하고 기본 문구를 보완합니다.
export function getAskChatAnswerFailureMessage(
  answerGeneration?: AskChatAnswerGeneration,
) {
  if (answerGeneration?.success !== false) return null;
  return (
    answerGeneration.message ??
    "답변 생성에 오류가 발생했어요. 다시 시도해주세요."
  );
}
