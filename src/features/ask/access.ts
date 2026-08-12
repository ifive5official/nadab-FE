export const ASK_CHAT_REQUIRED_RECORD_COUNT = 20;

// 누적 기록 수를 기준으로 물어보기 이용까지 필요한 답변 수를 계산합니다.
export function getAskChatRequiredRecordCount(totalRecordDays?: number) {
  return Math.max(
    ASK_CHAT_REQUIRED_RECORD_COUNT - Math.max(totalRecordDays ?? 0, 0),
    0,
  );
}

// 누적 기록이 물어보기 이용 기준을 충족했는지 판단합니다.
export function canAccessAskChat(totalRecordDays?: number) {
  return getAskChatRequiredRecordCount(totalRecordDays) === 0;
}
