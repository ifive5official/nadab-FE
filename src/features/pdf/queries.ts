import { queryOptions } from "@tanstack/react-query";
import {
  getCurrentPdfExport,
  getPdfExportArchive,
  getPdfExportStatus,
} from "./api";

// PDF 작업 상태를 작업별 캐시 키로 조회합니다.
export const pdfExportStatusOptions = (jobId: number) =>
  queryOptions({
    queryKey: ["currentUser", "pdf-exports", "status", jobId] as const,
    queryFn: () => getPdfExportStatus(jobId),
    enabled: Number.isInteger(jobId) && jobId > 0,
  });

export const currentPdfExportOptions = queryOptions({
  queryKey: ["currentUser", "pdf-exports", "current"] as const,
  queryFn: getCurrentPdfExport,
  staleTime: 0,
});

export const pdfExportArchiveOptions = queryOptions({
  queryKey: ["currentUser", "pdf-exports", "archive"] as const,
  queryFn: getPdfExportArchive,
});
