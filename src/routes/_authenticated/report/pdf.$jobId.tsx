import { AppIcon } from "@/components/AppIcon";
import BlockButton from "@/components/BlockButton";
import {
  PdfCompletedStatusView,
  PdfFailedStatusView,
  PdfGeneratingStatusView,
  PdfStatusLayout,
  type PdfReceiptData,
} from "@/features/pdf/components/PdfStatusViews";
import { getPdfExportPreview } from "@/features/pdf/api";
import {
  currentPdfExportOptions,
  pdfExportArchiveOptions,
  pdfExportStatusOptions,
} from "@/features/pdf/queries";
import type { PdfExportType } from "@/features/pdf/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/report/pdf/$jobId")({
  component: RouteComponent,
});

const PDF_STATUS_POLL_INTERVAL = 3000;

// 생성 요청을 마친 PDF 작업을 완료나 실패까지 폴링해 표시합니다.
function RouteComponent() {
  const { jobId: jobIdParam } = Route.useParams();
  const jobId = Number(jobIdParam);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isPending, isError } = useQuery({
    ...pdfExportStatusOptions(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PENDING" || status === "IN_PROGRESS"
        ? PDF_STATUS_POLL_INTERVAL
        : false;
    },
  });
  const currentPdfExportQuery = useQuery(currentPdfExportOptions);
  const currentData =
    currentPdfExportQuery.data?.jobId === jobId
      ? currentPdfExportQuery.data
      : null;
  const previewQuery = useQuery({
    queryKey: [
      "currentUser",
      "pdf-exports",
      "preview",
      data?.startDate,
      data?.endDate,
    ],
    queryFn: () =>
      getPdfExportPreview({
        startDate: data!.startDate!,
        endDate: data!.endDate!,
      }),
    enabled: !!data?.startDate && !!data?.endDate && !currentData,
  });
  const receipt = createReceiptData(data ?? {}, currentData ?? previewQuery.data);

  useCompletedPdfRedirect(data?.status === "COMPLETED", navigate);

  useEffect(() => {
    if (data?.status !== "COMPLETED" && data?.status !== "FAILED") return;

    queryClient.invalidateQueries({
      queryKey: ["currentUser", "pdf-exports", "current"],
    });
    if (data.status === "COMPLETED") {
      queryClient.invalidateQueries({
        queryKey: ["currentUser", "pdf-exports", "archive"],
      });
      queryClient.prefetchQuery(pdfExportArchiveOptions);
    }
    if (data.status === "FAILED") {
      queryClient.invalidateQueries({ queryKey: ["currentUser", "crystals"] });
    }
  }, [data?.status, queryClient]);

  // 실패한 조건을 다시 선택할 수 있도록 PDF 설정 화면으로 돌아갑니다.
  function retryPdfExport() {
    navigate({
      to: "/report/pdf",
      search:
        data?.startDate && data?.endDate && data?.type
          ? {
              startDate: data.startDate,
              endDate: data.endDate,
              type: data.type as PdfExportType,
            }
          : {},
    });
  }

  if (!Number.isInteger(jobId) || jobId <= 0 || isError) {
    return (
      <PdfStatusLayout>
        <AppIcon name="error-filled" color="error" size={48} />
        <p className="text-label-l text-text-primary">
          PDF 작업을 확인할 수 없어요.
        </p>
        <p className="text-caption-m text-text-tertiary">
          잠시 후 다시 시도해 주세요.
        </p>
        <BlockButton onClick={retryPdfExport} className="mt-gap-y-l">
          다시 PDF 생성하기
        </BlockButton>
      </PdfStatusLayout>
    );
  }

  if (isPending || !data) {
    return (
      <PdfStatusLayout>
        <PdfGeneratingStatusView checking />
      </PdfStatusLayout>
    );
  }

  if (data.status === "COMPLETED") {
    return (
      <PdfStatusLayout>
        <PdfCompletedStatusView receipt={receipt} />
      </PdfStatusLayout>
    );
  }

  if (data.status === "FAILED") {
    return (
      <PdfStatusLayout>
        <PdfFailedStatusView onRetry={retryPdfExport} receipt={receipt} />
      </PdfStatusLayout>
    );
  }

  return (
    <PdfStatusLayout>
      <PdfGeneratingStatusView receipt={receipt} />
    </PdfStatusLayout>
  );
}

// 완료 화면이 실제로 노출된 시간을 기준으로 2초 뒤 아카이브로 이동합니다.
function useCompletedPdfRedirect(
  isCompleted: boolean,
  navigate: ReturnType<typeof useNavigate>,
) {
  useEffect(() => {
    if (!isCompleted) return;

    let remainingTime = 2000;
    let startedAt = 0;
    let timer: number | undefined;

    // 남은 완료 안내 시간이 지나면 뒤로 가기 기록을 남기지 않고 이동합니다.
    function startTimer() {
      if (document.visibilityState !== "visible" || timer) return;

      startedAt = Date.now();
      timer = window.setTimeout(() => {
        navigate({ to: "/report/pdf/history", replace: true });
      }, remainingTime);
    }

    // 화면을 보지 않는 동안에는 완료 안내 노출 시간을 계산하지 않습니다.
    function pauseTimer() {
      if (!timer) return;

      window.clearTimeout(timer);
      timer = undefined;
      remainingTime = Math.max(0, remainingTime - (Date.now() - startedAt));
    }

    // 앱이나 탭의 활성 상태에 맞춰 완료 안내 타이머를 이어갑니다.
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") startTimer();
      else pauseTimer();
    }

    startTimer();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timer) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isCompleted, navigate]);
}

// 상태 및 개수 응답을 화면에 표시할 영수증 데이터로 변환합니다.
function createReceiptData(
  status: {
    startDate?: string;
    endDate?: string;
    type?: string;
  },
  counts?: {
    answerCount?: number;
    weeklyCount?: number;
    monthlyCount?: number;
  } | null,
): PdfReceiptData {
  const type = ["REPORT_ONLY", "ANSWER_ONLY", "REPORT_AND_ANSWER"].includes(
    status.type ?? "",
  )
    ? (status.type as PdfExportType)
    : "REPORT_AND_ANSWER";

  return {
    startDate: status.startDate ?? "-",
    endDate: status.endDate ?? "-",
    type,
    answerCount: counts?.answerCount ?? 0,
    weeklyCount: counts?.weeklyCount ?? 0,
    monthlyCount: counts?.monthlyCount ?? 0,
  };
}
