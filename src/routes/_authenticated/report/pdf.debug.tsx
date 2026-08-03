import {
  PdfCompletedStatusView,
  PdfFailedStatusView,
  PdfGeneratingStatusView,
  PdfStatusLayout,
} from "@/features/pdf/components/PdfStatusViews";
import useToastStore from "@/store/toastStore";
import { createFileRoute } from "@tanstack/react-router";
import clsx from "clsx";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/report/pdf/debug")({
  component: RouteComponent,
});

const DEBUG_STATUSES = ["생성 중", "생성 완료", "생성 실패"] as const;
type DebugStatus = (typeof DEBUG_STATUSES)[number];

const DEBUG_RECEIPT = {
  startDate: "2026-01-01",
  endDate: "2026-08-02",
  type: "REPORT_AND_ANSWER" as const,
  answerCount: 24,
  weeklyCount: 12,
  monthlyCount: 7,
};

// API 호출 없이 PDF 생성 상태별 화면을 전환해 확인합니다.
function RouteComponent() {
  const [status, setStatus] = useState<DebugStatus>("생성 중");
  const { showToast } = useToastStore();

  // 디버깅 화면의 버튼 동작 여부를 토스트로 확인합니다.
  function showDebugAction(message: string) {
    showToast({ message, variant: "success" });
  }

  const controls = (
    <div className="flex flex-col gap-gap-y-s py-gap-y-m">
      <div className="grid grid-cols-3 gap-gap-s">
        {DEBUG_STATUSES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setStatus(item)}
            className={clsx(
              "rounded-radius-m border px-gap-x-s py-gap-y-s text-label-s",
              status === item
                ? "border-button-primary-border-default bg-button-primary-bg-default text-text-inverse"
                : "border-button-tertiary-border-default bg-button-tertiary-bg-default text-text-primary",
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <PdfStatusLayout title="PDF 상태 디버깅" topContent={controls}>
      {status === "생성 중" && <PdfGeneratingStatusView receipt={DEBUG_RECEIPT} />}
      {status === "생성 완료" && (
        <PdfCompletedStatusView receipt={DEBUG_RECEIPT} />
      )}
      {status === "생성 실패" && (
        <PdfFailedStatusView
          onRetry={() => showDebugAction("PDF 재생성 버튼을 눌렀어요.")}
          receipt={DEBUG_RECEIPT}
        />
      )}
    </PdfStatusLayout>
  );
}
