import { Badge } from "@/components/Badges";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { LoadingIcon } from "@/components/Icons";
import { AppIcon } from "@/components/AppIcon";
import NoResult from "@/components/NoResult";
import {
  allReportsOptions,
  type AllReportItem,
} from "@/features/report/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

const REPORTS_PER_PAGE = 5;
const LOAD_MORE_DELAY_MS = 600;
const SCROLL_TOP_BUTTON_THRESHOLD = 320;

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
  const { data: reports } = useSuspenseQuery(allReportsOptions);
  const [visibleCount, setVisibleCount] = useState(REPORTS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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

  return (
    <>
      <SubHeader>이전 리포트</SubHeader>
      <Container ref={containerRef} onScroll={handleScroll}>
        {reports.length > 0 ? (
          <div className="py-padding-y-m flex flex-col gap-gap-y-s">
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
          <NoResult
            className="m-auto"
            title="아직 이전 리포트가 없어요."
            description={"리포트를 생성하면\n이곳에서 다시 볼 수 있어요."}
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
  const reportLabel = getReportLabel(report);

  return (
    <article className="flex flex-col gap-gap-y-m rounded-2xl bg-surface-layer-1 px-padding-x-m py-padding-y-m shadow-1">
      <div className="flex items-center justify-between gap-gap-x-m">
        <Badge>{reportLabel}</Badge>
        <span className="shrink-0 text-caption-s text-text-tertiary">
          {formatReportVersion(report)}
        </span>
      </div>
      <div className="flex flex-col gap-gap-y-xs">
        <h2 className="text-label-l text-text-primary">
          {report.period ?? "기간 정보 없음"}
        </h2>
        <p className="text-caption-l text-text-secondary line-clamp-2">
          {report.summary ?? "요약이 아직 준비되지 않았어요."}
        </p>
      </div>
    </article>
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

function getReportLabel(report: AllReportItem) {
  switch (report.type) {
    case "MONTHLY":
      return "월간 리포트";
    case "WEEKLY":
      return "주간 리포트";
    default:
      return "리포트";
  }
}

function formatReportVersion(report: AllReportItem) {
  if (report.type !== "MONTHLY" || !report.version) {
    return "";
  }

  return `v${report.version}`;
}
