// 이전 리포트 보기 페이지
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  monthlyReportV1DetailOptions,
  monthlyReportV2Options,
  periodicReportOptions,
} from "@/features/report/quries";
import BlockButton from "@/components/BlockButton";
import useErrorStore from "@/store/modalStore";
import { REPORT_CONFIGS } from "@/features/report/reportConfigs";
import { getPreviousPeriodText } from "@/lib/getPrevPeriod";
import useModalStore from "@/store/modalStore";
import { splitSegmentsBySentence } from "@/features/report/splitSegmentsBySentence";
import SpeechBalloon from "@/components/Speechballoon";
import type { components } from "@/generated/api-types";
import { StyledSegments } from "@/features/report/ReportComponents";

type PeriodicReportResponse = components["schemas"]["WeeklyReportResponse"];
type MonthlyReportLocator =
  components["schemas"]["MonthlyReportLocatorResponse"];

const reportTypeSchema = z.object({
  reportType: z.enum(["weekly", "monthly"]),
  period: z.enum(["previous", "current"]),
});

export const Route = createFileRoute(
  "/_authenticated/report/$reportType/$period",
)({
  component: RouteComponent,
  parseParams: (params) => reportTypeSchema.parse(params),
  loader: async ({ params: { reportType, period }, context: { queryClient } }) => {
    if (reportType === "monthly") {
      const reports = await queryClient.ensureQueryData(monthlyReportV2Options);
      const locator =
        period === "previous" ? reports.previousReport : reports.report;

      if (getReportVersion(locator) === "1" && locator?.reportId) {
        await queryClient.ensureQueryData(
          monthlyReportV1DetailOptions(locator.reportId),
        );
      }
      return;
    }

    queryClient.ensureQueryData(periodicReportOptions(reportType));
  },
});

function RouteComponent() {
  const { reportType, period } = Route.useParams();

  if (reportType === "monthly") {
    return <MonthlyReportV1Detail period={period} />;
  }

  return <PeriodicReportDetail reportType={reportType} period={period} />;
}

function PeriodicReportDetail({
  reportType,
  period,
}: {
  reportType: "weekly";
  period: "previous" | "current";
}) {
  const { showError } = useModalStore();
  const config = REPORT_CONFIGS[reportType];
  const { data: reports } = useSuspenseQuery(periodicReportOptions(reportType));
  const prevReport = reports.previousReport;
  const currentReport = reports.report;
  const report = (
    period === "previous" ? prevReport : currentReport
  ) as PeriodicReportResponse; // 지금 보고 있는 리포트
  const navigate = useNavigate();
  const BTN_CONFIG = {
    current: {
      // 이번주 리포트 보고 있으면
      label: `${getPreviousPeriodText(reportType, "prev")} 리포트 보기`,
      variant: prevReport?.status === "COMPLETED" ? "secondary" : "disabled",
      onclick: () => {
        if (prevReport) {
          navigate({ to: `/report/${reportType}/previous`, replace: true });
        } else {
          showError("이전 리포트가\n존재하지 않아요.");
        }
      },
    },
    previous: {
      // 저번주 리포트 보고 있으면
      label: `${getPreviousPeriodText(reportType, "current")} 리포트 보기`,
      variant: currentReport?.status === "COMPLETED" ? "primary" : "disabled",
      onclick: () => {
        if (currentReport?.status === "COMPLETED") {
          navigate({ to: `/report/${reportType}/current`, replace: true });
        } else {
          showError(`다음 리포트가\n완성되지 못했어요.`);
        }
      },
    },
  } as const;

  const comments = splitSegmentsBySentence(
    report?.content?.improve?.segments ?? [],
  );

  //   Todo: 에러 처리 보완
  useEffect(() => {
    if (!report) {
      useErrorStore.getState().showError("리포트를 불러올 수 없어요.");
    } else if (report.status !== "COMPLETED") {
      useErrorStore
        .getState()
        .showError("리포트를 생성하는 중이에요.", "조금만 기다려 주세요.");
    }
  }, [report]);

  return (
    <>
      <SubHeader>{config.label}</SubHeader>
      <Container>
        <div className="flex-1 flex flex-col">
          <div className="-mx-padding-x-m px-padding-x-m flex flex-col items-center justify-center gap-margin-y-s bg-[url(/periodic-report-bg.png)] bg-cover h-[calc((150/796)*100*var(--dvh))]">
            <span className="text-caption-m text-text-secondary">
              {report?.month}월{" "}
              {reportType === "weekly" && `${report?.weekOfMonth}주차 `}리포트
            </span>
            {/* eslint-disable react/no-unescaped-entities */}
            <span className="text-title-2 text-center break-keep">
              <span className="italic mr-1">"</span>
              {report?.summary}
              <span className="italic">"</span>
            </span>
          </div>
          <div className="my-padding-y-xl flex flex-col gap-padding-y-xxl">
            <section className="flex flex-col gap-gap-y-l">
              <div className="flex">
                <img
                  className="aspect-square w-6 mr-0.5"
                  src="/icon/magnifying-glass.png"
                  alt="돋보기 아이콘"
                />
                <span className="text-label-m text-text-secondary">
                  이런 면도 발견되었어요
                </span>
              </div>
              <div className="text-body-2 bg-surface-layer-1 border border-border-base rounded-xl px-padding-x-m py-padding-y-m allow-copy">
                <StyledSegments
                  segments={report?.content?.discovered?.segments ?? []}
                  type="mix"
                />
              </div>
            </section>
            <section className="flex flex-col gap-gap-y-l">
              <div className="flex">
                <img
                  className="aspect-square w-6 mr-0.5"
                  src="/icon/heart.png"
                  alt="하트 아이콘"
                />
                <span className="text-label-m text-text-secondary">
                  나답의 한 마디
                </span>
              </div>
              <div className="flex flex-col gap-gap-y-l px-padding-x-m allow-copy">
                {comments?.map((comment, i) => (
                  <SpeechBalloon
                    key={i}
                    textColor="var(--color-text-primary)"
                    bgColor="var(--color-surface-layer-1)"
                  >
                    <StyledSegments segments={comment} type="bold" />
                  </SpeechBalloon>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-auto">
            <BlockButton
              variant={BTN_CONFIG[period].variant}
              onClick={BTN_CONFIG[period].onclick}
            >
              {BTN_CONFIG[period].label}
            </BlockButton>
          </div>
        </div>
      </Container>
    </>
  );
}

function MonthlyReportV1Detail({
  period,
}: {
  period: "previous" | "current";
}) {
  const navigate = useNavigate();
  const { data: locators } = useSuspenseQuery(monthlyReportV2Options);
  const locator =
    period === "previous" ? locators.previousReport : locators.report;

  if (getReportVersion(locator) === "2") {
    return <RedirectToMonthlyReportV2 period={period} />;
  }

  if (!isV1Locator(locator)) {
    return (
      <InvalidMonthlyReport onClose={() => navigate({ to: "/report" })} />
    );
  }

  return <MonthlyReportV1Content reportId={locator.reportId} period={period} />;
}

function MonthlyReportV1Content({
  reportId,
  period,
}: {
  reportId: number;
  period: "previous" | "current";
}) {
  const navigate = useNavigate();
  const { showError } = useModalStore();
  const config = REPORT_CONFIGS.monthly;
  const { data: report } = useSuspenseQuery(
    monthlyReportV1DetailOptions(reportId),
  );
  const { data: locators } = useSuspenseQuery(monthlyReportV2Options);
  const nextLocator =
    period === "current" ? locators.previousReport : locators.report;
  const nextLabel =
    period === "current"
      ? `${getPreviousPeriodText("monthly", "prev")} 리포트 보기`
      : `${getPreviousPeriodText("monthly", "current")} 리포트 보기`;
  const nextVariant =
    nextLocator?.status === "COMPLETED"
      ? period === "current"
        ? "secondary"
        : "primary"
      : "disabled";

  const goToLocator = () => {
    if (!nextLocator) {
      showError(
        period === "current"
          ? "이전 리포트가\n존재하지 않아요."
          : "다음 리포트가\n완성되지 못했어요.",
      );
      return;
    }

    const nextPeriod = period === "current" ? "previous" : "current";
    const version = getReportVersion(nextLocator);

    if (version === "1") {
      navigate({ to: `/report/monthly/${nextPeriod}`, replace: true });
      return;
    }

    if (version === "2") {
      navigate({ to: `/report/monthly-v2/${nextPeriod}`, replace: true });
      return;
    }

    showError("리포트 버전을 확인할 수 없어요.");
  };

  const comments = splitSegmentsBySentence(
    report.content?.improve?.segments ?? [],
  );

  useEffect(() => {
    if (report.status && report.status !== "COMPLETED") {
      useErrorStore
        .getState()
        .showError("리포트를 생성하는 중이에요.", "조금만 기다려 주세요.");
    }
  }, [report.status]);

  return (
    <>
      <SubHeader>{config.label}</SubHeader>
      <Container>
        <div className="flex-1 flex flex-col">
          <div className="-mx-padding-x-m px-padding-x-m flex flex-col items-center justify-center gap-margin-y-s bg-[url(/periodic-report-bg.png)] bg-cover h-[calc((150/796)*100*var(--dvh))]">
            <span className="text-caption-m text-text-secondary">
              {report.month}월 리포트
            </span>
            <span className="text-title-2 text-center break-keep">
              <span className="italic mr-1">"</span>
              {report.summary}
              <span className="italic">"</span>
            </span>
          </div>
          <div className="my-padding-y-xl flex flex-col gap-padding-y-xxl">
            <section className="flex flex-col gap-gap-y-l">
              <div className="flex">
                <img
                  className="aspect-square w-6 mr-0.5"
                  src="/icon/magnifying-glass.png"
                  alt="돋보기 아이콘"
                />
                <span className="text-label-m text-text-secondary">
                  이런 면도 발견되었어요
                </span>
              </div>
              <div className="text-body-2 bg-surface-layer-1 border border-border-base rounded-xl px-padding-x-m py-padding-y-m allow-copy">
                <StyledSegments
                  segments={report.content?.discovered?.segments ?? []}
                  type="mix"
                />
              </div>
            </section>
            <section className="flex flex-col gap-gap-y-l">
              <div className="flex">
                <img
                  className="aspect-square w-6 mr-0.5"
                  src="/icon/heart.png"
                  alt="하트 아이콘"
                />
                <span className="text-label-m text-text-secondary">
                  나답의 한 마디
                </span>
              </div>
              <div className="flex flex-col gap-gap-y-l px-padding-x-m allow-copy">
                {comments.map((comment, i) => (
                  <SpeechBalloon
                    key={i}
                    textColor="var(--color-text-primary)"
                    bgColor="var(--color-surface-layer-1)"
                  >
                    <StyledSegments segments={comment} type="bold" />
                  </SpeechBalloon>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-auto">
            <BlockButton variant={nextVariant} onClick={goToLocator}>
              {nextLabel}
            </BlockButton>
          </div>
        </div>
      </Container>
    </>
  );
}

function InvalidMonthlyReport({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    useModalStore
      .getState()
      .showError("리포트를 불러올 수 없어요.", "다시 시도해주세요.");
    onClose();
  }, [onClose]);

  return (
    <>
      <SubHeader>{REPORT_CONFIGS.monthly.label}</SubHeader>
      <Container>{null}</Container>
    </>
  );
}

function RedirectToMonthlyReportV2({
  period,
}: {
  period: "previous" | "current";
}) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: `/report/monthly-v2/${period}` });
  }, [navigate, period]);

  return (
    <>
      <SubHeader>{REPORT_CONFIGS.monthly.label}</SubHeader>
      <Container>{null}</Container>
    </>
  );
}

function isV1Locator(
  locator: MonthlyReportLocator | undefined,
): locator is MonthlyReportLocator & { reportId: number; version: "1" } {
  return (
    getReportVersion(locator) === "1" && typeof locator?.reportId === "number"
  );
}

function getReportVersion(locator: MonthlyReportLocator | undefined) {
  return String(locator?.version ?? "");
}
