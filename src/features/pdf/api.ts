import type { ApiResponse } from "@/generated/api";
import { api } from "@/lib/axios";
import type {
  PdfExportPreview,
  PdfExportCurrentResponse,
  PdfExportDownloadResponse,
  PdfExportArchiveItem,
  PdfExportStartRequest,
  PdfExportStartResponse,
  PdfExportStatusResponse,
} from "./types";

export type PdfExportPeriod = {
  startDate: string;
  endDate: string;
};

// 선택 기간에 포함되는 PDF 콘텐츠 개수를 조회합니다.
export async function getPdfExportPreview({
  startDate,
  endDate,
}: PdfExportPeriod): Promise<PdfExportPreview> {
  const response = await api.get<ApiResponse<PdfExportPreview>>(
    "/api/v1/pdf-exports/preview",
    {
      params: { startDate, endDate },
    },
  );

  return response.data.data ?? {};
}

// 선택한 구성과 기간으로 PDF 비동기 생성을 시작합니다.
export async function startPdfExport(request: PdfExportStartRequest) {
  const response = await api.post<ApiResponse<PdfExportStartResponse>>(
    "/api/v1/pdf-exports",
    request,
  );

  return response.data.data;
}

// 작업 ID로 PDF 생성 진행 상태를 조회합니다.
export async function getPdfExportStatus(jobId: number) {
  const response = await api.get<ApiResponse<PdfExportStatusResponse>>(
    `/api/v1/pdf-exports/${jobId}`,
  );

  return response.data.data;
}

// 현재 사용자의 진행 중인 PDF 작업과 포함 개수를 조회합니다.
export async function getCurrentPdfExport() {
  const response = await api.get<ApiResponse<PdfExportCurrentResponse | null>>(
    "/api/v1/pdf-exports/current",
  );

  return response.data.data ?? null;
}

// 완료된 PDF 작업의 단기 다운로드 URL과 파일명을 발급합니다.
export async function issuePdfExportDownloadUrl(jobId: number) {
  const response = await api.post<ApiResponse<PdfExportDownloadResponse>>(
    `/api/v1/pdf-exports/${jobId}/download-url`,
  );

  return response.data.data;
}

// 생성 완료된 PDF 아카이브를 최신순으로 조회합니다.
export async function getPdfExportArchive() {
  const response = await api.get<ApiResponse<PdfExportArchiveItem[]>>(
    "/api/v1/pdf-exports",
  );

  return Array.isArray(response.data.data) ? response.data.data : [];
}
