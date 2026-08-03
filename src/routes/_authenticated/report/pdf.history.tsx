import { AppIcon } from "@/components/AppIcon";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { LoadingIcon } from "@/components/Icons";
import NoResult from "@/components/NoResult";
import { openPdfDownload } from "@/features/pdf/download";
import { pdfExportArchiveOptions } from "@/features/pdf/queries";
import {
  getPdfExportTypeLabel,
  type PdfExportArchiveItem,
  type PdfExportType,
} from "@/features/pdf/types";
import { useIssuePdfExportDownloadMutation } from "@/features/pdf/useIssuePdfExportDownloadMutation";
import useModalStore from "@/store/modalStore";
import useToastStore from "@/store/toastStore";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/report/pdf/history")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(pdfExportArchiveOptions),
});

// 사용자가 생성한 PDF 목록 화면을 표시합니다.
function RouteComponent() {
  const navigate = useNavigate();
  const now = useArchiveClock();
  const { data: archive = [], isPending, isError } = useQuery(
    pdfExportArchiveOptions,
  );
  const { showError } = useModalStore();
  const { showToast } = useToastStore();
  const downloadMutation = useIssuePdfExportDownloadMutation({
    onSuccess: ({ downloadUrl, fileName }) => {
      if (!downloadUrl) {
        showError("PDF 다운로드 주소를 확인할 수 없어요.");
        return;
      }
      openPdfDownload(downloadUrl, fileName).catch(() => {
        showError("PDF 다운로드를 시작하지 못했어요.", "다시 시도해 주세요.");
      });
    },
    onExpired: () => {
      showError(
        "PDF 보관 기간이 만료되었어요.",
        "같은 조건으로 PDF를 다시 생성해 주세요.",
      );
    },
    onNotCompleted: () => {
      showToast({
        message: "PDF 생성이 아직 완료되지 않았어요.",
        variant: "error",
      });
    },
    onRateLimited: () => {
      showToast({
        message: "다운로드 요청이 많아요. 잠시 후 다시 시도해 주세요.",
        variant: "error",
      });
    },
  });

  return (
    <>
      <SubHeader>이전에 생성한 PDF 보기</SubHeader>
      <Container>
        {isPending ? (
          <div className="flex flex-1 items-center justify-center">
            <LoadingIcon color="var(--color-icon-primary)" />
          </div>
        ) : isError ? (
          <NoResult
            className="my-auto"
            title="PDF 목록을 불러오지 못했어요."
            description="잠시 후 다시 시도해 주세요."
          />
        ) : archive.length === 0 ? (
          <NoResult
            className="my-auto"
            title="생성한 PDF가 없어요."
            description="기록과 리포트를 PDF로 모아보세요."
          />
        ) : (
          <div className="flex flex-col gap-gap-y-m py-padding-y-m">
            <p className="text-caption-m text-text-secondary">
              총 {archive.length}개
            </p>
            {archive.map((item, index) => (
              <PdfArchiveItem
                key={item.jobId ?? index}
                item={item}
                now={now}
                isDownloading={
                  downloadMutation.isPending &&
                  downloadMutation.variables === item.jobId
                }
                onDownload={(jobId) => downloadMutation.mutate(jobId)}
                onRegenerate={(archiveItem) =>
                  navigate({
                    to: "/report/pdf",
                    search: getRegenerateSearch(archiveItem),
                  })
                }
              />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}

// 완료된 PDF 한 건의 구성, 기간, 보관 상태와 액션을 표시합니다.
function PdfArchiveItem({
  item,
  now,
  isDownloading,
  onDownload,
  onRegenerate,
}: {
  item: PdfExportArchiveItem;
  now: number;
  isDownloading: boolean;
  onDownload: (jobId: number) => void;
  onRegenerate: (item: PdfExportArchiveItem) => void;
}) {
  const expiresAt = item.expiresAt ? new Date(item.expiresAt).getTime() : NaN;
  const isExpired =
    !!item.expired || (!Number.isNaN(expiresAt) && expiresAt <= now);
  const canDownload = !isExpired && !!item.jobId;

  return (
    <article className="flex items-center justify-between gap-gap-x-m rounded-xl border border-border-base bg-surface-base p-padding-x-m">
      <div className="flex min-w-0 items-center gap-gap-x-s">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-layer-1">
          <AppIcon
            name={isExpired ? "file-copy-off" : "file-copy"}
            color={isExpired ? "disabled" : "default"}
            size={24}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-gap-y-xs">
          <p
            className={`text-label-m ${
              isExpired ? "text-text-tertiary" : "text-text-primary"
            }`}
          >
            {item.startDate} ~ {item.endDate}
          </p>
          <div className="flex min-w-0 items-center gap-gap-x-s text-caption-s">
            <span
              className={`shrink-0 ${
                isExpired ? "text-text-tertiary" : "text-text-primary"
              }`}
            >
              {getPdfExportTypeLabel(item.type)}
            </span>
            <span
              className={`truncate ${
                isExpired ? "text-text-disabled" : "text-text-tertiary"
              }`}
            >
              {formatRemainingTime(item.expiresAt, now, isExpired)}
            </span>
          </div>
        </div>
      </div>
      {canDownload ? (
        <button
          type="button"
          aria-label="PDF 다운로드"
          onClick={() => onDownload(item.jobId!)}
          disabled={isDownloading}
          className="flex size-10 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
        >
          {isDownloading ? (
            <LoadingIcon color="var(--color-icon-default)" height={24} />
          ) : (
            <AppIcon name="download" color="default" size={24} />
          )}
        </button>
      ) : (
        <button
          type="button"
          aria-label="PDF 다시 생성하기"
          onClick={() => onRegenerate(item)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full"
        >
          <AppIcon name="refresh-2" color="disabled" size={24} />
        </button>
      )}
    </article>
  );
}

// 아카이브 만료 시간이 자연스럽게 갱신되도록 현재 시각을 매분 제공합니다.
function useArchiveClock() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

// PDF 다운로드 만료까지 남은 시간을 일·시간·분 단위로 표시합니다.
function formatRemainingTime(
  expiresAt: string | undefined,
  now: number,
  isExpired: boolean,
) {
  if (isExpired) return "만료";
  if (!expiresAt) return "보관 기간 내 다운로드할 수 있어요.";

  const remaining = new Date(expiresAt).getTime() - now;
  if (Number.isNaN(remaining) || remaining <= 0) {
    return "만료";
  }

  const totalMinutes = Math.max(1, Math.ceil(remaining / 60_000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `만료까지 ${days}일 ${hours}시간`;
  if (hours > 0) return `만료까지 ${hours}시간 ${minutes}분`;
  return `만료까지 ${minutes}분`;
}

// 만료된 PDF와 같은 조건을 복원할 수 있는 검색 파라미터를 만듭니다.
function getRegenerateSearch(item: PdfExportArchiveItem) {
  const type = isPdfExportType(item.type) ? item.type : undefined;

  if (!item.startDate || !item.endDate || !type) return {};
  return {
    startDate: item.startDate,
    endDate: item.endDate,
    type,
  };
}

// API 문자열이 지원하는 PDF 내보내기 유형인지 확인합니다.
function isPdfExportType(type: string | undefined): type is PdfExportType {
  return (
    type === "REPORT_ONLY" ||
    type === "ANSWER_ONLY" ||
    type === "REPORT_AND_ANSWER"
  );
}
