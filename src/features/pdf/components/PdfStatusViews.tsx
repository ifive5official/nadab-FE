import { AppIcon } from "@/components/AppIcon";
import BlockButton from "@/components/BlockButton";
import { CrystalBadge } from "@/components/Badges";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { LoadingIcon } from "@/components/Icons";
import Seperator from "@/components/Seperator";
import type { PdfExportType } from "@/features/pdf/types";

export type PdfReceiptData = {
  startDate: string;
  endDate: string;
  type: PdfExportType;
  answerCount: number;
  weeklyCount: number;
  monthlyCount: number;
};

// PDF 생성 조건을 확인 모달과 같은 영수증 형태로 요약합니다.
export function PdfExportReceiptCard({ data }: { data: PdfReceiptData }) {
  const includesAnswers = data.type !== "REPORT_ONLY";
  const includesReports = data.type !== "ANSWER_ONLY";
  const includedItems = [
    ...(includesAnswers
      ? [{ label: "답변", count: data.answerCount, icon: "text-align-left" as const }]
      : []),
    ...(includesReports
      ? [
          { label: "주간리포트", count: data.weeklyCount, icon: "book" as const },
          { label: "월간리포트", count: data.monthlyCount, icon: "book" as const },
        ]
      : []),
  ];
  const cost = data.type === "REPORT_AND_ANSWER" ? 100 : 50;

  return (
    <div className="w-full rounded-2xl border border-border-base bg-surface-layer-1 px-padding-x-m text-left text-text-secondary">
      <section className="flex items-center justify-between gap-gap-x-m py-padding-y-m">
        <p className="text-label-m">기간</p>
        <p className="text-right text-caption-m">
          {data.startDate} ~ {data.endDate}
        </p>
      </section>
      <Seperator />
      <section className="flex flex-col py-padding-y-m">
        <p className="text-label-m">포함 내용</p>
        <div className="mt-padding-y-m flex flex-col gap-y-[calc((var(--spacing-gap-y-s)+var(--spacing-gap-y-m))/2)]">
          {includedItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-gap-x-s">
              <span className="flex items-center gap-gap-x-xs rounded-full border border-button-tertiary-border-default bg-surface-base px-padding-x-s py-padding-y-xs text-caption-s">
                <AppIcon name={item.icon} size={16} color="current" />
                {item.label}
              </span>
              <strong className="min-w-8 text-right text-caption-m">{item.count}개</strong>
            </div>
          ))}
        </div>
      </section>
      <Seperator />
      <section className="flex items-center justify-between gap-gap-x-m py-padding-y-m">
        <p className="text-label-m">차감 크리스탈</p>
        <CrystalBadge crystals={cost} />
      </section>
    </div>
  );
}

// 상태 안내 문구와 영수증 카드를 구분선과 간격으로 분리합니다.
function PdfStatusReceipt({ data }: { data: PdfReceiptData }) {
  return (
    <div className="flex w-full flex-col gap-gap-y-l">
      <Seperator />
      <PdfExportReceiptCard data={data} />
    </div>
  );
}

// PDF 상태 화면에 공통으로 쓰이는 헤더와 중앙 정렬 영역을 제공합니다.
export function PdfStatusLayout({
  children,
  title = "PDF 다운로드",
  topContent,
}: {
  children: React.ReactNode;
  title?: string;
  topContent?: React.ReactNode;
}) {
  return (
    <>
      <SubHeader>{title}</SubHeader>
      <Container>
        {topContent}
        <div className="flex flex-1 flex-col items-center justify-center gap-gap-y-m text-center">
          {children}
        </div>
      </Container>
    </>
  );
}

// PDF 파일을 생성하고 있는 상태를 안내합니다.
export function PdfGeneratingStatusView({
  checking = false,
  receipt,
}: {
  checking?: boolean;
  receipt?: PdfReceiptData;
}) {
  return (
    <>
      <div className="my-margin-y-xxl flex flex-col items-center gap-gap-y-m">
        <LoadingIcon color="var(--color-icon-primary)" />
        <p className="text-label-l text-text-primary">
          {checking ? "PDF 생성 상태를 확인하고 있어요." : "PDF를 생성 중이에요."}
        </p>
        {!checking && (
          <p className="text-center text-caption-m text-text-tertiary">
            화면을 나가도 계속 만들어져요.
            <br />완료되면 알림으로 알려드릴게요.
          </p>
        )}
      </div>
      {receipt && <PdfStatusReceipt data={receipt} />}
    </>
  );
}

// 생성이 끝난 PDF의 기간과 다운로드 동작을 표시합니다.
export function PdfCompletedStatusView({
  receipt,
}: {
  receipt: PdfReceiptData;
}) {
  return (
    <>
      <div className="my-margin-y-xxl flex flex-col items-center gap-gap-y-m">
        <AppIcon name="circle-check-filled" color="primary" size={48} />
        <p className="text-label-l text-text-primary">PDF 생성이 완료됐어요.</p>
      </div>
      <PdfStatusReceipt data={receipt} />
    </>
  );
}

// PDF 생성에 실패한 상태와 재시도 동작을 안내합니다.
export function PdfFailedStatusView({
  onRetry,
  receipt,
}: {
  onRetry: () => void;
  receipt: PdfReceiptData;
}) {
  return (
    <>
      <div className="my-margin-y-xxl flex flex-col items-center gap-gap-y-m">
        <AppIcon name="error-filled" color="error" size={48} />
        <p className="text-label-l text-text-primary">PDF 생성에 실패했어요.</p>
        <p className="text-center text-caption-m text-text-tertiary">
          크리스탈은 정상적으로 환불됐어요.
          <br />PDF를 다시 생성하려면 아래 버튼을 눌러주세요.
        </p>
      </div>
      <PdfStatusReceipt data={receipt} />
      <BlockButton onClick={onRetry} className="mt-gap-y-l">
        다시 PDF 생성하기
      </BlockButton>
    </>
  );
}
