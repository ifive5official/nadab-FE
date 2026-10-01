import { AppIcon } from "@/components/AppIcon";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import Seperator from "@/components/Seperator";
import BlockButton from "@/components/BlockButton";
import { CrystalBadge } from "@/components/Badges";
import { LoadingIcon } from "@/components/Icons";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import useToastStore from "@/store/toastStore";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import { getPdfExportPreview } from "@/features/pdf/api";
import {
  PDF_CONTENT_CONFIG,
  PDF_CONTENT_OPTIONS,
  getPdfContentCount,
  type PdfContentOption,
  type PdfExportPreview,
  type PdfExportType,
} from "@/features/pdf/types";
import { useStartPdfExportMutation } from "@/features/pdf/useStartPdfExportMutation";
import useModalStore from "@/store/modalStore";
import { currentPdfExportOptions } from "@/features/pdf/queries";
import { useAdRewardFlow } from "@/features/ad-rewards/useAdRewardFlow";
import { PDF_AD_REWARD_FEATURES } from "@/features/ad-rewards/types";

const PERIOD_OPTIONS = [
  "최근 12개월",
  "최근 6개월",
  "최근 3개월",
  "최근 1개월",
  "최근 1주",
  "직접 설정",
] as const;
const PDF_TOAST_BOTTOM =
  "bottom-[calc(var(--spacing-margin-y-xxxl)+var(--safe-bottom))]";

type PeriodOption = (typeof PERIOD_OPTIONS)[number];
type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};
type SelectedDateRange = {
  startDate: string;
  endDate: string;
};
type DateField = keyof DateRange;
type PdfRetrySearch = {
  startDate?: string;
  endDate?: string;
  type?: PdfExportType;
};

export const Route = createFileRoute("/_authenticated/report/pdf")({
  validateSearch: validatePdfRetrySearch,
  component: RouteComponent,
});

// 기본 PDF 경로에서는 설정 화면을, 하위 경로에서는 해당 자식 화면을 표시합니다.
function RouteComponent() {
  const location = useLocation();

  if (location.pathname !== "/report/pdf") {
    return <Outlet />;
  }

  const retrySearch = validatePdfRetrySearch(
    location.search as Record<string, unknown>,
  );
  const retryKey = [
    retrySearch.startDate,
    retrySearch.endDate,
    retrySearch.type,
  ].join(":");

  return <PdfExportSetupPage key={retryKey} retrySearch={retrySearch} />;
}

// PDF 생성 조건을 선택하고 생성 요청을 시작하는 설정 화면을 표시합니다.
function PdfExportSetupPage({ retrySearch }: { retrySearch: PdfRetrySearch }) {
  const hasRetryCondition =
    !!retrySearch.startDate && !!retrySearch.endDate && !!retrySearch.type;
  const { showToast } = useToastStore();
  const { showError } = useModalStore();
  const navigate = useNavigate();
  const { requestReward, isRewardBusy } = useAdRewardFlow();
  const currentPdfExportQuery = useQuery(currentPdfExportOptions);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption | null>(
    hasRetryCondition ? "직접 설정" : null,
  );
  const [selectedContent, setSelectedContent] =
    useState<PdfContentOption | null>(() =>
      getPdfContentOptionByType(retrySearch.type),
    );
  const [selectedDateRange, setSelectedDateRange] =
    useState<SelectedDateRange | null>(() =>
      hasRetryCondition
        ? {
            startDate: retrySearch.startDate!,
            endDate: retrySearch.endDate!,
          }
        : null,
    );
  const [preview, setPreview] = useState<PdfExportPreview | null>(null);
  const previewMutation = useMutation({
    mutationFn: getPdfExportPreview,
    onSuccess: (data) => {
      const totalCount =
        (data.answerCount ?? 0) +
        (data.weeklyCount ?? 0) +
        (data.monthlyCount ?? 0);

      if (totalCount === 0) {
        setPreview(null);
        showToast({
          message: "선택한 기간에는 담을 기록이나 리포트가 없어요.",
          variant: "error",
          bottom: PDF_TOAST_BOTTOM,
        });
        return;
      }

      setPreview(data);
      if (selectedContent && getPdfContentCount(selectedContent, data) === 0) {
        setSelectedContent(null);
      }
    },
    onError: () => {
      setPreview(null);
      showToast({
        message: "기간에 포함된 기록을 확인하지 못했어요.",
        variant: "error",
        bottom: PDF_TOAST_BOTTOM,
      });
    },
  });
  const isPeriodComplete = preview !== null;
  const startPdfExportMutation = useStartPdfExportMutation({
    onSuccess: (data) => {
      setIsConfirmModalOpen(false);
      if (!data.jobId) {
        showError("PDF 생성 작업을 확인할 수 없어요.", "다시 시도해 주세요.");
        return;
      }
      navigate({
        to: "/report/pdf/$jobId",
        params: { jobId: String(data.jobId) },
      });
    },
    onAlreadyInProgress: (jobId) => {
      setIsConfirmModalOpen(false);
      navigate({
        to: "/report/pdf/$jobId",
        params: { jobId: String(jobId) },
      });
    },
    onInvalidPeriod: () => {
      setIsConfirmModalOpen(false);
      showToast({
        message: "기간을 다시 확인해 주세요.",
        variant: "error",
        bottom: PDF_TOAST_BOTTOM,
      });
    },
    onNoData: () => {
      setIsConfirmModalOpen(false);
      setPreview(null);
      showToast({
        message: "선택한 기간에는 담을 기록이나 리포트가 없어요.",
        variant: "error",
        bottom: PDF_TOAST_BOTTOM,
      });
    },
    onInsufficientBalance: (request) => {
      setIsConfirmModalOpen(false);
      if (requestReward(PDF_AD_REWARD_FEATURES[request.type], () => startPdfExportMutation.mutateAsync(request))) return;
      showError(
        "현재 보유한\n크리스탈이 부족해요.",
        "크리스탈을 모은 뒤 다시 시도해 주세요.",
      );
    },
    onServerBusy: () => {
      setIsConfirmModalOpen(false);
      showToast({
        message: "PDF 생성 요청이 많아요. 잠시 후 다시 시도해 주세요.",
        variant: "error",
        bottom: PDF_TOAST_BOTTOM,
      });
    },
  });

  useEffect(() => {
    if (
      currentPdfExportQuery.isFetching ||
      !currentPdfExportQuery.data?.jobId
    ) {
      return;
    }

    navigate({
      to: "/report/pdf/$jobId",
      params: { jobId: String(currentPdfExportQuery.data.jobId) },
      replace: true,
    });
  }, [currentPdfExportQuery.data?.jobId, currentPdfExportQuery.isFetching, navigate]);

  useEffect(() => {
    if (!hasRetryCondition) return;

    previewMutation.mutate({
      startDate: retrySearch.startDate!,
      endDate: retrySearch.endDate!,
    });
    // 실패 화면에서 전달된 최초 조건은 진입 시 한 번만 복원합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 기간 선택을 갱신하고 프리셋 기간이면 미리보기 데이터를 조회합니다.
  function handlePeriodSelect(period: PeriodOption) {
    setSelectedPeriod(period);
    setSelectedContent(null);
    setSelectedDateRange(null);
    setPreview(null);

    if (period !== "직접 설정") {
      const dateRange = getPresetDateRange(period);
      setSelectedDateRange(dateRange);
      previewMutation.mutate(dateRange);
    }
  }

  // 직접 설정한 날짜 범위로 미리보기 데이터를 조회합니다.
  function handleCustomPeriodComplete(range: DateRange) {
    if (!range.startDate || !range.endDate) {
      setPreview(null);
      return;
    }

    if (!isValidPdfDateRange(range.startDate, range.endDate)) {
      setPreview(null);
      showToast({
        message: "기간은 오늘까지 최대 1년 이내로 선택해 주세요.",
        variant: "error",
        bottom: PDF_TOAST_BOTTOM,
      });
      return;
    }

    setSelectedContent(null);
    setPreview(null);
    const dateRange = {
      startDate: formatISODate(range.startDate),
      endDate: formatISODate(range.endDate),
    };
    setSelectedDateRange(dateRange);
    previewMutation.mutate(dateRange);
  }

  // 최종 선택 내용과 소모 크리스탈을 확인하는 생성 확인 모달을 엽니다.
  function handleCreateClick() {
    if (!isPeriodComplete || !selectedContent) return;
    setIsConfirmModalOpen(true);
  }

  // 확인한 조건을 API 요청 타입으로 변환해 PDF 생성을 시작합니다.
  function handleConfirmCreate() {
    if (!selectedContent || !selectedDateRange || isRewardBusy || startPdfExportMutation.isPending) return;

    startPdfExportMutation.mutate({
      type: PDF_CONTENT_CONFIG[selectedContent].type,
      startDate: selectedDateRange.startDate,
      endDate: selectedDateRange.endDate,
    });
  }

  if (
    currentPdfExportQuery.isPending ||
    currentPdfExportQuery.isFetching ||
    currentPdfExportQuery.data?.jobId
  ) {
    return (
      <>
        <SubHeader>PDF 다운로드</SubHeader>
        <Container className="items-center justify-center gap-gap-y-m text-center">
          <LoadingIcon color="var(--color-icon-primary)" />
          <p className="text-label-l text-text-primary">
            진행 중인 PDF 작업을 확인하고 있어요.
          </p>
        </Container>
      </>
    );
  }

  return (
    <>
      <SubHeader>PDF 다운로드</SubHeader>
      <Container>
        <Link to="/report/pdf/history" className="py-padding-y-l">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-caption-m text-text-primary">
                생성한 PDF 모아보기
              </span>
              <span className="text-caption-s text-text-tertiary">
                생성 후 최대 7일 동안 확인하고 다운로드할 수 있어요.
              </span>
            </div>
            <div>
              <AppIcon name="chevron-right" />
            </div>
          </div>
        </Link>
        <Seperator />
        <div className="flex flex-col gap-gap-y-m bg-surface-layer-1 border border-border-base p-padding-x-m rounded-xl">
          <header className="flex gap-x-gap-x-m">
            <div className="bg-icon-default text-surface-base flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
              1
            </div>
            <span className="text-label-l">기간을 선택해 보세요.</span>
          </header>
          <div className="grid grid-cols-3 gap-gap-x-s gap-gap-y-s">
            {PERIOD_OPTIONS.map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => handlePeriodSelect(period)}
                className={clsx(
                  "rounded-lg border px-padding-x-xs py-padding-y-xs text-label-s",
                  selectedPeriod === period
                    ? "border-brand-primary bg-brand-primary text-button-primary-text-default"
                    : "border-button-tertiary-border-default bg-button-tertiary-bg-default text-button-tertiary-text-default",
                )}
              >
                {period}
              </button>
            ))}
          </div>
          {selectedPeriod === "직접 설정" && (
            <InlineDateRangePicker
              initialRange={selectedDateRange}
              onComplete={handleCustomPeriodComplete}
              onEdit={() => setPreview(null)}
            />
          )}
          {previewMutation.isPending && (
            <p className="text-center text-caption-s text-text-tertiary">
              선택한 기간의 기록을 확인하고 있어요.
            </p>
          )}
        </div>
        {isPeriodComplete && (
          <div className="mt-gap-y-m flex flex-col gap-gap-y-m rounded-xl border border-border-base bg-surface-layer-1 p-padding-x-m">
            <header className="flex items-start gap-x-gap-x-m">
              <div className="bg-icon-default text-surface-base flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                2
              </div>
              <span className="text-label-l">
                답변부터 리포트까지, 무엇을 담아볼까요?
              </span>
            </header>
            <div className="grid grid-cols-3 gap-gap-x-s">
              <PreviewCount label="답변" count={preview.answerCount} />
              <PreviewCount label="주간 리포트" count={preview.weeklyCount} />
              <PreviewCount label="월간 리포트" count={preview.monthlyCount} />
            </div>
            <div className="flex flex-col gap-gap-y-s">
              {PDF_CONTENT_OPTIONS.map((option) => {
                const isAvailable = getPdfContentCount(option, preview) > 0;

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedContent(option)}
                    className={clsx(
                      "flex w-full items-center justify-between gap-gap-x-s rounded-lg border px-padding-x-m py-padding-y-s text-left text-label-s disabled:cursor-not-allowed disabled:opacity-40",
                      selectedContent === option
                        ? "border-brand-primary bg-brand-primary text-button-primary-text-default"
                        : "border-button-tertiary-border-default bg-button-tertiary-bg-default text-button-tertiary-text-default",
                    )}
                  >
                    <span>{option}</span>
                    <CrystalBadge crystals={PDF_CONTENT_CONFIG[option].cost} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <BlockButton
          type="button"
          disabled={!isPeriodComplete || !selectedContent || isRewardBusy || startPdfExportMutation.isPending}
          onClick={handleCreateClick}
          className="mt-auto pt-gap-y-l"
        >
          이 방식으로 PDF 생성하기
        </BlockButton>
      </Container>
      {selectedContent && selectedDateRange && preview && (
        <PdfExportConfirmModal
          isOpen={isConfirmModalOpen}
          selectedContent={selectedContent}
          dateRange={selectedDateRange}
          preview={preview}
          cost={PDF_CONTENT_CONFIG[selectedContent].cost}
          isLoading={startPdfExportMutation.isPending || isRewardBusy}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmCreate}
        />
      )}
    </>
  );
}

// 선택한 PDF 구성과 크리스탈 비용을 확인하는 전용 모달을 표시합니다.
function PdfExportConfirmModal({
  isOpen,
  selectedContent,
  dateRange,
  preview,
  cost,
  isLoading,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  selectedContent: PdfContentOption;
  dateRange: SelectedDateRange;
  preview: PdfExportPreview;
  cost: number;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const includedItems = getIncludedPreviewItems(selectedContent, preview);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-neutral-dark-50"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-x-padding-x-m top-1/2 z-50 flex -translate-y-1/2 flex-col rounded-2xl border border-border-base bg-surface-base px-padding-x-xl py-padding-y-xl text-text-primary shadow-3 sm:mx-auto sm:w-[412px] dark:bg-surface-layer-2"
          >
            <div className="mb-gap-y-l flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-full bg-surface-layer-1">
                <AppIcon name="circle-check-filled" color="primary" size={24} />
              </div>
              <button
                type="button"
                aria-label="PDF 생성 확인 닫기"
                onClick={onClose}
                disabled={isLoading}
                className="flex size-6 items-center justify-center text-icon-muted"
              >
                <AppIcon name="close-big" color="current" size={24} />
              </button>
            </div>

            <p className="text-label-l text-text-primary">
              이렇게 PDF를 생성할까요?
            </p>

            <div className="mt-gap-y-l flex flex-col text-text-secondary">
              <section className="flex items-center justify-between gap-gap-x-m py-padding-y-m">
                <p className="text-label-m">기간</p>
                <p className="text-right text-caption-m">
                  {dateRange.startDate} ~ {dateRange.endDate}
                </p>
              </section>
              <Seperator />
              <section className="flex flex-col py-padding-y-m">
                <p className="text-label-m">포함 내용</p>
                <div className="mt-padding-y-m flex w-full flex-col gap-y-[calc((var(--spacing-gap-y-s)+var(--spacing-gap-y-m))/2)]">
                  {includedItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex w-full items-center justify-between gap-gap-x-s"
                    >
                      <span className="flex items-center gap-gap-x-xs rounded-full border border-button-tertiary-border-default bg-surface-layer-1 px-padding-x-s py-padding-y-xs text-caption-s">
                        <AppIcon name={item.icon} size={16} color="current" />
                        <span>{item.label}</span>
                      </span>
                      <strong className="min-w-8 text-right text-caption-m">
                        {item.count}개
                      </strong>
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

            <div className="mt-gap-y-l flex gap-gap-x-s">
              <BlockButton
                variant="secondary"
                disabled={isLoading}
                onClick={onClose}
              >
                취소
              </BlockButton>
              <BlockButton isLoading={isLoading} onClick={onConfirm}>
                확인
              </BlockButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("modal-root")!,
  );
}

// 선택한 PDF 구성에 해당하는 답변과 리포트 수량만 모달에 표시합니다.
function getIncludedPreviewItems(
  selectedContent: PdfContentOption,
  preview: PdfExportPreview,
) {
  const answer = {
    label: "답변",
    count: preview.answerCount ?? 0,
    icon: "text-align-left" as const,
  };
  const weeklyReport = {
    label: "주간 리포트",
    count: preview.weeklyCount ?? 0,
    icon: "book" as const,
  };
  const monthlyReport = {
    label: "월간 리포트",
    count: preview.monthlyCount ?? 0,
    icon: "book" as const,
  };

  if (selectedContent === "답변만 담을래요") return [answer];
  if (selectedContent === "리포트만 담을래요") {
    return [weeklyReport, monthlyReport];
  }

  return [answer, weeklyReport, monthlyReport];
}

// PDF 미리보기 응답의 콘텐츠별 개수를 요약해서 표시합니다.
function PreviewCount({
  label,
  count,
}: {
  label: string;
  count: number | undefined;
}) {
  return (
    <div className="flex flex-col items-center gap-gap-y-xs rounded-lg bg-surface-base px-padding-x-xs py-padding-y-s text-center">
      <span className="text-caption-s text-text-tertiary">{label}</span>
      <strong className="text-label-l text-text-primary">{count ?? 0}개</strong>
    </div>
  );
}

// PDF에 포함할 시작일과 종료일을 카드 안에서 선택할 수 있게 합니다.
function InlineDateRangePicker({
  initialRange,
  onComplete,
  onEdit,
}: {
  initialRange?: SelectedDateRange | null;
  onComplete: (range: DateRange) => void;
  onEdit: () => void;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [range, setRange] = useState<DateRange>({
    startDate: parseISODate(initialRange?.startDate),
    endDate: parseISODate(initialRange?.endDate),
  });
  const [activeField, setActiveField] = useState<DateField | null>(null);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const calendarDays = useMemo(
    () => createCalendarDays(visibleMonth),
    [visibleMonth],
  );
  const isCurrentMonth =
    visibleMonth.getFullYear() === today.getFullYear() &&
    visibleMonth.getMonth() === today.getMonth();

  // 선택할 날짜 필드의 달력을 열고 기존 값을 임시 선택값으로 불러옵니다.
  function openCalendar(field: DateField) {
    const selectedDate = range[field];
    const initialDate = selectedDate ?? today;

    setActiveField(field);
    setPendingDate(selectedDate);
    onEdit();
    setVisibleMonth(
      new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
    );
  }

  // 달력에서 고른 임시 날짜를 현재 필드의 최종 값으로 확정합니다.
  function confirmDate() {
    if (!activeField || !pendingDate) return;

    const nextRange =
      activeField === "startDate"
        ? {
            startDate: pendingDate,
            endDate:
              range.endDate &&
              range.endDate >= pendingDate &&
              range.endDate <= addYearsClamped(pendingDate, 1)
                ? range.endDate
                : null,
          }
        : { ...range, endDate: pendingDate };

    setRange(nextRange);
    if (nextRange.startDate && nextRange.endDate) {
      onComplete(nextRange);
    }
    setActiveField(null);
    setPendingDate(null);
  }

  // 현재 달을 기준으로 이전 달을 보여줍니다.
  function showPreviousMonth() {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  }

  // 미래 달을 넘지 않는 범위에서 다음 달을 보여줍니다.
  function showNextMonth() {
    if (isCurrentMonth) return;

    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  }

  return (
    <section className="flex flex-col gap-gap-y-s border-t border-border-base pt-padding-y-m">
      <div className="grid grid-cols-2 gap-gap-x-s">
        <DateValue
          label="시작일"
          date={range.startDate}
          isActive={activeField === "startDate"}
          onClick={() => openCalendar("startDate")}
        />
        <DateValue
          label="종료일"
          date={range.endDate}
          isActive={activeField === "endDate"}
          onClick={() => openCalendar("endDate")}
        />
      </div>

      {activeField && (
        <div className="flex flex-col gap-gap-y-s">
          <div className="flex items-center justify-between py-padding-y-xs">
            <strong className="text-label-l">
              {visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월
            </strong>
            <div className="flex gap-gap-x-xs">
              <button
                type="button"
                aria-label="이전 달"
                onClick={showPreviousMonth}
                className="flex h-8 w-8 items-center justify-center"
              >
                <AppIcon name="chevron-left" />
              </button>
              <button
                type="button"
                aria-label="다음 달"
                onClick={showNextMonth}
                disabled={isCurrentMonth}
                className="flex h-8 w-8 items-center justify-center disabled:opacity-30"
              >
                <AppIcon name="chevron-right" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-caption-s text-text-tertiary">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <span key={day} className="py-padding-y-xs">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-gap-y-xs text-center">
            {calendarDays.map(({ date, isInVisibleMonth }) => {
              const isFuture = date > today;
              const isBeforeStart =
                activeField === "endDate" &&
                !!range.startDate &&
                date < range.startDate;
              const exceedsOneYear =
                activeField === "endDate" &&
                !!range.startDate &&
                date > addYearsClamped(range.startDate, 1);
              const isDisabled =
                !isInVisibleMonth ||
                isFuture ||
                isBeforeStart ||
                exceedsOneYear;
              const isSelected = isSameDay(date, pendingDate);

              return (
                <button
                  key={formatISODate(date)}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setPendingDate(date)}
                  className={clsx(
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-caption-m",
                    !isInVisibleMonth && "invisible",
                    isDisabled && isInVisibleMonth && "text-text-disabled",
                    isSelected && "bg-brand-primary text-text-inverse-primary",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <BlockButton
            type="button"
            disabled={!pendingDate}
            onClick={confirmDate}
            className="mt-gap-y-xs"
          >
            확인
          </BlockButton>
        </div>
      )}
    </section>
  );
}

// 재시도 URL의 날짜와 PDF 유형만 유효한 검색 조건으로 허용합니다.
function validatePdfRetrySearch(search: Record<string, unknown>): PdfRetrySearch {
  const isDate = (value: unknown): value is string =>
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const isPdfType = (value: unknown): value is PdfExportType =>
    value === "REPORT_ONLY" ||
    value === "ANSWER_ONLY" ||
    value === "REPORT_AND_ANSWER";

  if (
    !isDate(search.startDate) ||
    !isDate(search.endDate) ||
    !isPdfType(search.type)
  ) {
    return {};
  }

  const startDate = parseISODate(search.startDate);
  const endDate = parseISODate(search.endDate);
  if (!startDate || !endDate || !isValidPdfDateRange(startDate, endDate)) {
    return {};
  }

  return {
    startDate: search.startDate,
    endDate: search.endDate,
    type: search.type,
  };
}

// API의 PDF 유형을 설정 화면에서 사용하는 선택 문구로 변환합니다.
function getPdfContentOptionByType(
  type: PdfExportType | undefined,
): PdfContentOption | null {
  if (type === "REPORT_ONLY") return "리포트만 담을래요";
  if (type === "ANSWER_ONLY") return "답변만 담을래요";
  if (type === "REPORT_AND_ANSWER") return "리포트와 답변 모두 담을래요";
  return null;
}

// API 날짜 문자열을 날짜 선택기의 로컬 날짜 값으로 변환합니다.
function parseISODate(value: string | undefined) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

// PDF 기간이 날짜 순서, 미래 날짜, 최대 1년 규칙을 모두 만족하는지 확인합니다.
function isValidPdfDateRange(startDate: Date, endDate: Date) {
  const today = startOfDay(new Date());

  return (
    startDate <= endDate &&
    endDate <= today &&
    endDate <= addYearsClamped(startDate, 1)
  );
}

// 라벨과 날짜 선택 배지를 분리해 현재 선택값과 달력 진입점을 표시합니다.
function DateValue({
  label,
  date,
  isActive,
  onClick,
}: {
  label: string;
  date: Date | null;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-gap-y-xs">
      <span className="text-caption-s text-text-tertiary">{label}</span>
      <button
        type="button"
        onClick={onClick}
        className={clsx(
          "flex items-center justify-between gap-gap-x-xs rounded-lg border bg-field-bg-default px-padding-x-s py-padding-y-xs text-left text-caption-m",
          isActive ? "border-brand-primary" : "border-field-border-default",
          date ? "text-text-primary" : "text-text-disabled",
        )}
      >
        <span>{date ? formatISODate(date) : "yyyy-mm-dd"}</span>
        <AppIcon name="calendar-minus" size={20} />
      </button>
    </div>
  );
}

// 달력에 표시할 6주 분량의 날짜 셀을 생성합니다.
function createCalendarDays(visibleMonth: Date) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + index,
    );

    return {
      date,
      isInVisibleMonth:
        date.getFullYear() === year && date.getMonth() === month,
    };
  });
}

// 날짜의 시간 정보를 제거해 일 단위 비교가 가능하게 합니다.
function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// 날짜에 지정한 연수를 더해 선택 가능한 최대 종료일을 계산합니다.
function addYearsClamped(date: Date, years: number) {
  const targetYear = date.getFullYear() + years;
  const lastDay = new Date(targetYear, date.getMonth() + 1, 0).getDate();

  return new Date(
    targetYear,
    date.getMonth(),
    Math.min(date.getDate(), lastDay),
  );
}

// nullable 날짜 두 개가 같은 날짜인지 확인합니다.
function isSameDay(left: Date, right: Date | null) {
  return (
    !!right &&
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

// 날짜를 API 요청에 사용하는 YYYY-MM-DD 형식으로 변환합니다.
function formatISODate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

// 선택한 프리셋을 오늘까지의 API 조회 기간으로 변환합니다.
function getPresetDateRange(period: Exclude<PeriodOption, "직접 설정">): {
  startDate: string;
  endDate: string;
} {
  const endDate = startOfDay(new Date());
  let startDate: Date;

  if (period === "최근 1주") {
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
  } else {
    const monthsByPeriod = {
      "최근 12개월": 12,
      "최근 6개월": 6,
      "최근 3개월": 3,
      "최근 1개월": 1,
    } as const;

    startDate = subtractMonths(endDate, monthsByPeriod[period]);
  }

  return {
    startDate: formatISODate(startDate),
    endDate: formatISODate(endDate),
  };
}

// 월말 날짜가 다음 달로 넘어가지 않도록 보정하며 개월 수를 뺍니다.
function subtractMonths(date: Date, months: number) {
  const target = new Date(date);
  const originalDay = target.getDate();

  target.setDate(1);
  target.setMonth(target.getMonth() - months);
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();
  target.setDate(Math.min(originalDay, lastDay));

  return target;
}
