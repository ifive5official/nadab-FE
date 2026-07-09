import SegmentedControls from "@/components/SegmentedControls";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { LoadingIcon } from "@/components/Icons";
import { AppIcon } from "@/components/AppIcon";
import InlineButton from "@/components/InlineButton";
import NoResult from "@/components/NoResult";
import { Popover } from "@/components/Popover";
import {
  allReportsOptions,
  monthlyReportHistoryOptions,
  type AllReportItem,
  type AllReportType,
  weeklyReportHistoryOptions,
} from "@/features/report/queries";
import { currentUserOptions } from "@/features/user/queries";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import Seperator from "@/components/Seperator";

const REPORTS_PER_PAGE = 5;
const LOAD_MORE_DELAY_MS = 600;
const SCROLL_TOP_BUTTON_THRESHOLD = 320;

const REPORT_TYPE_FILTER_OPTIONS: {
  label: string;
  value: AllReportType;
}[] = [
  { label: "전체", value: "ALL" },
  { label: "주간", value: "WEEKLY" },
  { label: "월간", value: "MONTHLY" },
];
const REPORT_HISTORY_NO_RESULT_TITLES: Record<AllReportType, string> = {
  ALL: "완성된 리포트가\n존재하지 않아요.",
  WEEKLY: "완성된 주간 리포트가\n존재하지 않아요.",
  MONTHLY: "완성된 월간 리포트가\n존재하지 않아요.",
};
const REPORT_HISTORY_NO_RESULT_DESCRIPTION =
  "이야기를 조금 더 채워주시면,\n{name}님만의 리포트를 전해드릴게요.";

export const Route = createFileRoute("/_authenticated/report/history")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(allReportsOptions),
  component: RouteComponent,
});

function RouteComponent() {
  const location = useLocation();

  if (location.pathname !== "/report/history") {
    return <Outlet />;
  }

  return <ReportHistoryList />;
}

function ReportHistoryList() {
  const [selectedReportType, setSelectedReportType] =
    useState<AllReportType>("ALL");
  const { data: reports = [], isPending } = useQuery(
    getReportHistoryOptions(selectedReportType),
  );
  const { data: currentUser } = useQuery(currentUserOptions);
  const [visibleCount, setVisibleCount] = useState(REPORTS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const loadMoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { ref } = useInView({
    onChange: (inView) => {
      if (
        !inView ||
        isLoadingMore ||
        loadMoreTimerRef.current ||
        visibleCount >= reports.length
      ) {
        return;
      }

      setIsLoadingMore(true);
      loadMoreTimerRef.current = setTimeout(() => {
        setVisibleCount((prev) =>
          Math.min(prev + REPORTS_PER_PAGE, reports.length),
        );
        setIsLoadingMore(false);
        loadMoreTimerRef.current = null;
      }, LOAD_MORE_DELAY_MS);
    },
  });
  const visibleReports = useMemo(
    () => reports.slice(0, visibleCount),
    [reports, visibleCount],
  );
  const hasNextPage = visibleCount < reports.length;
  const noResultProps = getReportHistoryNoResultProps(
    selectedReportType,
    currentUser?.nickname,
  );

  const handleScroll = () => {
    const scrollTop = containerRef.current?.scrollTop ?? 0;
    setShowScrollTopButton(scrollTop > SCROLL_TOP_BUTTON_THRESHOLD);
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    return () => {
      if (loadMoreTimerRef.current) {
        clearTimeout(loadMoreTimerRef.current);
      }
    };
  }, []);

  const handleReportTypeChange = (value: string) => {
    setSelectedReportType(value as AllReportType);
    // TODO: 타입 탭 전환 시 각 탭의 visibleCount를 보존하도록 개선합니다.
    setVisibleCount(REPORTS_PER_PAGE);
    setIsLoadingMore(false);
    setIsPopoverOpen(false);

    if (loadMoreTimerRef.current) {
      clearTimeout(loadMoreTimerRef.current);
      loadMoreTimerRef.current = null;
    }
  };

  return (
    <>
      <SubHeader>이전 리포트</SubHeader>
      <Container ref={containerRef} onScroll={handleScroll} className="">
        <ReportHistoryTypeFilterPanel
          selected={selectedReportType}
          onChange={handleReportTypeChange}
        />
        <div className="-mx-margin-x-l">
          <Seperator className="mt-margin-y-l" />
        </div>
        {(isPending || reports.length > 0) && (
          <p className="text-caption-m mt-margin-y-m">
            {isPending ? "리포트를 불러오는 중" : `총 ${reports.length}개`}
          </p>
        )}
        {isPending ? (
          <div className="flex min-h-40 items-center justify-center">
            <LoadingIcon color="var(--color-icon-primary)" />
          </div>
        ) : reports.length > 0 ? (
          <div className="py-padding-y-xs flex flex-col gap-gap-y-xs -mx-margin-x-l">
            {visibleReports.map((report, index) => (
              <ReportHistoryItem
                key={`${report.type ?? "report"}-${report.id ?? index}`}
                report={report}
              />
            ))}
            {hasNextPage && (
              <div
                ref={ref}
                className="flex min-h-12 items-center justify-center"
              >
                {isLoadingMore && (
                  <LoadingIcon color="var(--color-icon-primary)" />
                )}
              </div>
            )}
          </div>
        ) : (
          <ReportHistoryNoResult
            title={noResultProps.title}
            description={noResultProps.description}
            isPopoverOpen={isPopoverOpen}
            onPopoverOpen={() => setIsPopoverOpen(true)}
            onPopoverClose={() => setIsPopoverOpen(false)}
          />
        )}
      </Container>
      {showScrollTopButton && (
        <button
          type="button"
          aria-label="맨 위로 이동"
          onClick={scrollToTop}
          className="fixed z-10 right-padding-x-l bottom-[calc(var(--spacing-padding-y-m)+var(--safe-bottom))] bottom-support-legacy flex h-12 w-12 items-center justify-center rounded-full bg-surface-layer-1 shadow-4 border border-border-base sm:right-[calc((100vw-412px)/2+var(--spacing-padding-x-l))]"
        >
          <AppIcon name="arrow-up-circle-filled" size={40} color="primary" />
        </button>
      )}
    </>
  );
}

// 이전 리포트 빈 목록에서 완성 조건 안내 버튼과 팝오버를 함께 표시합니다.
function ReportHistoryNoResult({
  title,
  description,
  isPopoverOpen,
  onPopoverOpen,
  onPopoverClose,
}: {
  title: string;
  description: string;
  isPopoverOpen: boolean;
  onPopoverOpen: () => void;
  onPopoverClose: () => void;
}) {
  return (
    <div className="relative m-auto flex flex-col items-center gap-gap-y-m">
      <NoResult title={title} description={description} />
      <InlineButton
        size="s"
        variant="tertiary"
        onClick={onPopoverOpen}
        className=""
      >
        <div className="flex gap-x-gap-x-xs">
          <AppIcon name="info" size={20} color="current" />
          <p className="text-button-3">더 알아보기</p>
        </div>
      </InlineButton>
      <div className="absolute z-1 top-full mt-margin-y-m flex justify-center">
        <Popover
          isOpen={isPopoverOpen}
          onClose={onPopoverClose}
          className="w-[min(328px,calc(100vw-48px))] whitespace-nowrap"
        />
      </div>
    </div>
  );
}

// 이전 리포트 목록을 리포트 타입별로 볼 수 있게 하는 상단 필터 패널입니다.
function ReportHistoryTypeFilterPanel({
  selected,
  onChange,
}: {
  selected: AllReportType;
  onChange: (value: string) => void;
}) {
  return (
    <SegmentedControls
      options={REPORT_TYPE_FILTER_OPTIONS}
      selected={selected}
      onChange={onChange}
      className="mt-padding-y-m"
    />
  );
}

function ReportHistoryItem({ report }: { report: AllReportItem }) {
  const linkProps = getReportLinkProps(report);
  const content = <ReportHistoryItemContent report={report} />;

  if (!linkProps) {
    return content;
  }

  return (
    <Link
      to={linkProps.to}
      params={linkProps.params}
      search={linkProps.search}
      className="block"
    >
      {content}
    </Link>
  );
}

function ReportHistoryItemContent({ report }: { report: AllReportItem }) {
  return (
    <article className="flex items-center justify-between gap-x-gap-x-l px-padding-x-m py-padding-y-xs">
      <ReportHistoryThumbnail report={report} />
      <div className="flex flex-col flex-1">
        <h2 className="text-label-m text-text-primary">
          {report.period ?? "기간 정보 없음"} {getReportPeriodTypeLabel(report)}
        </h2>
        <p className="text-caption-m text-text-primary line-clamp-2">
          {getReportSummaryText(report)}
        </p>
        <p className="text-caption-m text-icon-muted">23시간 전</p>
      </div>
      <div>
        <AppIcon name="chevron-right" size={24} />
      </div>
    </article>
  );
}

// 이전 리포트 row 앞에 표시할 리포트 타입별 썸네일입니다.
function ReportHistoryThumbnail({ report }: { report: AllReportItem }) {
  const label = getReportPeriodTypeLabel(report);

  return (
    <div className="shrink-0 w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
      <img
        src={getReportIconSrc(report)}
        alt={`${label} 아이콘`}
        className="h-12 aspect-square object-contain"
        loading="lazy"
      />
    </div>
  );
}

function getReportLinkProps(report: AllReportItem) {
  if (!report.id) return null;

  if (report.type === "WEEKLY") {
    return {
      to: "/report/history/$reportType/$reportId",
      params: { reportType: "weekly", reportId: report.id },
      search: {},
    } as const;
  }

  if (report.type === "MONTHLY") {
    return {
      to: "/report/history/$reportType/$reportId",
      params: { reportType: "monthly", reportId: report.id },
      search: { version: getMonthlyReportVersion(report) },
    } as const;
  }

  return null;
}

function getMonthlyReportVersion(report: AllReportItem): "1" | "2" {
  return report.version === 1 ? "1" : "2";
}

function getReportSummaryText(report: AllReportItem): string {
  const summary = report.summary?.trim();
  return `"${summary || "나의 기록을 돌아볼 수 있는 리포트예요."}"`;
}

// 선택한 리포트 타입과 사용자 이름에 맞는 빈 목록 문구를 만듭니다.
function getReportHistoryNoResultProps(
  reportType: AllReportType,
  nickname?: string,
) {
  const name = nickname?.trim() || "OO";

  return {
    title: REPORT_HISTORY_NO_RESULT_TITLES[reportType],
    description: REPORT_HISTORY_NO_RESULT_DESCRIPTION.replace("{name}", name),
  };
}

function getReportHistoryOptions(reportType: AllReportType) {
  if (reportType === "WEEKLY") {
    return weeklyReportHistoryOptions;
  }

  if (reportType === "MONTHLY") {
    return monthlyReportHistoryOptions;
  }

  return allReportsOptions;
}

function getReportIconSrc(report: AllReportItem): string {
  if (report.type === "WEEKLY") {
    return "/icon/weekly-report.png";
  }

  if (report.type === "MONTHLY") {
    return "/icon/monthly-report.png";
  }

  return "/icon/report.png";
}

function getReportPeriodTypeLabel(report: AllReportItem): string {
  if (report.type === "WEEKLY") {
    return "주간 리포트";
  }

  if (report.type === "MONTHLY") {
    return "월간 리포트";
  }

  return "리포트";
}
