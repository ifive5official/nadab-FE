import type { ApiErrResponse } from "@/generated/api";
import { handleDefaultApiError } from "@/lib/handleDefaultError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { startPdfExport } from "./api";
import type {
  PdfExportInProgressResponse,
  PdfExportStartResponse,
} from "./types";

type Props = {
  onSuccess: (data: PdfExportStartResponse) => void;
  onAlreadyInProgress: (jobId: number) => void;
  onInvalidPeriod: () => void;
  onNoData: () => void;
  onInsufficientBalance: () => void;
  onServerBusy: () => void;
};

// PDF 생성 시작 결과와 도메인 오류를 화면 동작으로 연결합니다.
export function useStartPdfExportMutation({
  onSuccess,
  onAlreadyInProgress,
  onInvalidPeriod,
  onNoData,
  onInsufficientBalance,
  onServerBusy,
}: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startPdfExport,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser", "crystals"] });
      onSuccess(data ?? {});
    },
    onError: (
      error: AxiosError<ApiErrResponse<PdfExportInProgressResponse>>,
    ) => {
      const code = error.response?.data?.code;

      if (code === "PDF_EXPORT_INVALID_PERIOD") return onInvalidPeriod();
      if (code === "PDF_EXPORT_NO_DATA") return onNoData();
      if (code === "WALLET_INSUFFICIENT_BALANCE") {
        return onInsufficientBalance();
      }
      if (code === "PDF_EXPORT_SERVER_BUSY") return onServerBusy();
      if (code === "PDF_EXPORT_ALREADY_IN_PROGRESS") {
        const jobId = error.response?.data?.data?.jobId;
        if (jobId) return onAlreadyInProgress(jobId);
      }

      handleDefaultApiError(error);
    },
  });
}
