// api 디폴트 에러 핸들러

import type { ApiErrResponse } from "@/generated/api";
import useModalStore from "@/store/modalStore";
import type { AxiosError } from "axios";

// 네트워크 에러 처리 위해 만듦
export const handleDefaultApiError = (
  /* eslint-disable @typescript-eslint/no-explicit-any */
  error: AxiosError<ApiErrResponse<any>>,
) => {
  const isNetworkError = error.code === "ERR_NETWORK";
  if (isNetworkError) {
    useModalStore
      .getState()
      .showError(
        "네트워크 연결이 불안정해요.",
        "네트워크 확인 후 다시 시도해주세요.",
      );
  } else {
    useModalStore
      .getState()
      .showError(
        error.response?.data?.code ?? error.message,
        error.response?.data?.message ?? "알 수 없는 에러가 발생했습니다.",
      );
  }
};
