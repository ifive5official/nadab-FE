import type { components } from "@/generated/api-types";

export const PDF_CONTENT_OPTIONS = [
  "리포트만 담을래요",
  "답변만 담을래요",
  "리포트와 답변 모두 담을래요",
] as const;

export type PdfContentOption = (typeof PDF_CONTENT_OPTIONS)[number];
export type PdfExportPreview =
  components["schemas"]["PdfExportPreviewResponse"];
export type PdfExportStartRequest =
  components["schemas"]["PdfExportStartRequest"];
export type PdfExportStartResponse =
  components["schemas"]["PdfExportStartResponse"];
export type PdfExportStatusResponse =
  components["schemas"]["PdfExportStatusResponse"];
export type PdfExportCurrentResponse =
  components["schemas"]["PdfExportCurrentResponse"];
export type PdfExportDownloadResponse =
  components["schemas"]["PdfExportDownloadResponse"];
export type PdfExportArchiveItem =
  components["schemas"]["PdfExportArchiveItemResponse"];
export type PdfExportInProgressResponse =
  components["schemas"]["PdfExportInProgressResponse"];
export type PdfExportType =
  components["schemas"]["PdfExportStartRequest"]["type"];

export const PDF_CONTENT_CONFIG: Record<
  PdfContentOption,
  { cost: number; type: PdfExportType }
> = {
  "리포트만 담을래요": { cost: 50, type: "REPORT_ONLY" },
  "답변만 담을래요": { cost: 50, type: "ANSWER_ONLY" },
  "리포트와 답변 모두 담을래요": {
    cost: 100,
    type: "REPORT_AND_ANSWER",
  },
};

// 선택한 PDF 구성에 실제로 포함될 콘텐츠의 총개수를 계산합니다.
export function getPdfContentCount(
  option: PdfContentOption,
  preview: PdfExportPreview,
) {
  const answerCount = preview.answerCount ?? 0;
  const reportCount =
    (preview.weeklyCount ?? 0) + (preview.monthlyCount ?? 0);

  if (option === "답변만 담을래요") return answerCount;
  if (option === "리포트만 담을래요") return reportCount;

  return answerCount + reportCount;
}

// PDF API 유형을 사용자에게 보여줄 포함 내용 이름으로 변환합니다.
export function getPdfExportTypeLabel(type: string | undefined) {
  if (type === "REPORT_ONLY") return "리포트";
  if (type === "ANSWER_ONLY") return "답변";
  if (type === "REPORT_AND_ANSWER") return "리포트, 답변";
  return "PDF";
}
