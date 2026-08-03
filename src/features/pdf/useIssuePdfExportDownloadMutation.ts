import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { issuePdfExportDownloadUrl } from "./api";
import type { PdfExportDownloadResponse } from "./types";

type Props = {
  onSuccess: (data: PdfExportDownloadResponse) => void;
  onExpired: () => void;
  onNotCompleted: () => void;
  onRateLimited: () => void;
};

// 다운로드 URL 발급 결과와 재시도 가능한 오류를 화면 동작으로 연결합니다.
export function useIssuePdfExportDownloadMutation({
  onSuccess,
  onExpired,
  onNotCompleted,
  onRateLimited,
}: Props) {
  return useMutation({
    mutationFn: issuePdfExportDownloadUrl,
    onSuccess: (data) => onSuccess(data ?? {}),
    onError: (error: AxiosError<ApiErrResponse<null>>) => {
      const code = error.response?.data?.code;

      if (code === "PDF_EXPORT_EXPIRED") return onExpired();
      if (code === "PDF_EXPORT_NOT_COMPLETED") return onNotCompleted();
      if (code === "PDF_EXPORT_DOWNLOAD_RATE_LIMITED") {
        return onRateLimited();
      }

      handleDefaultApiError(error);
    },
  });
}
