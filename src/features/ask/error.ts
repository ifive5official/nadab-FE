import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";
import useModalStore from "@/store/modalStore";
import type { AxiosError } from "axios";

export type AskChatErrorCode =
  | "ASK_CHAT_NOT_ENOUGH_ANSWERS"
  | "ASK_CHAT_SESSION_NOT_FOUND"
  | "ASK_CHAT_TURN_BALANCE_INSUFFICIENT"
  | "ASK_CHAT_TURN_LIMIT_EXCEEDED"
  | "ASK_CHAT_WALLET_NOT_FOUND"
  | "VALIDATION_FAILED"
  | "WALLET_INSUFFICIENT_BALANCE"
  | "WALLET_NOT_FOUND"
  | "USER_NOT_FOUND";

export type AskChatApiError = AxiosError<ApiErrResponse<null>>;

const ASK_CHAT_ERROR_MESSAGES: Partial<
  Record<AskChatErrorCode, { title: string; message?: string }>
> = {
  ASK_CHAT_NOT_ENOUGH_ANSWERS: {
    title: "아직 물어보기를 사용할 수 없어요.",
    message: "기록에 답변을 20개 이상 남기면 이용할 수 있어요.",
  },
  ASK_CHAT_SESSION_NOT_FOUND: {
    title: "대화를 찾을 수 없어요.",
    message: "삭제되었거나 접근할 수 없는 대화예요.",
  },
  ASK_CHAT_TURN_BALANCE_INSUFFICIENT: {
    title: "남은 대화 횟수가 없어요.",
    message: "대화권을 충전한 뒤 다시 질문해주세요.",
  },
  ASK_CHAT_TURN_LIMIT_EXCEEDED: {
    title: "한 대화의 메시지 한도에 도달했어요.",
    message:
      "한 대화에서 나눌 수 있는 15번의 질문과 답변을 모두 사용했어요. 새로운 대화를 시작하면 계속 질문할 수 있어요.",
  },
  WALLET_INSUFFICIENT_BALANCE: {
    title: "크리스탈이 부족해요.",
    message: "대화권 충전에는 크리스탈 200개가 필요해요.",
  },
  VALIDATION_FAILED: {
    title: "질문을 확인해주세요.",
    message: "질문은 공백을 제외하고 1자 이상 200자 이하로 적어주세요.",
  },
};

// 물어보기 API의 예상 가능한 오류를 사용자용 안내 문구로 변환합니다.
export function handleAskChatApiError(error: AskChatApiError) {
  const code = error.response?.data?.code as AskChatErrorCode | undefined;
  const config = code ? ASK_CHAT_ERROR_MESSAGES[code] : undefined;

  if (!config) {
    handleDefaultApiError(error);
    return;
  }

  useModalStore.getState().showError(config.title, config.message);
}

// 라우트 전환 같은 후속 처리가 필요한 오류인지 안전하게 판별합니다.
export function isAskChatError(
  error: unknown,
  code: AskChatErrorCode,
): error is AskChatApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as AskChatApiError).response?.data?.code === code
  );
}
