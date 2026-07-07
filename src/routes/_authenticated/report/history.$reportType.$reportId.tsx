import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import SpeechBalloon from "@/components/Speechballoon";
import { MonthlyReportV2Slides } from "@/features/report/monthly-v2/MonthlyReportV2Slides";
import {
  monthlyReportV1DetailOptions,
  monthlyReportV2DetailOptions,
  weeklyReportDetailOptions,
} from "@/features/report/queries";
import { StyledSegments } from "@/features/report/ReportComponents";
import { REPORT_CONFIGS } from "@/features/report/reportConfigs";
import { splitSegmentsBySentence } from "@/features/report/splitSegmentsBySentence";
import type { components } from "@/generated/api-types";
import useModalStore from "@/store/modalStore";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

type WeeklyReport = components["schemas"]["WeeklyReportResponse"];
type MonthlyReportV1 = components["schemas"]["MonthlyReportResponse"];

const paramsSchema = z.object({
  reportType: z.enum(["weekly", "monthly"]),
  reportId: z.coerce.number(),
});

const searchSchema = z.object({
  version: z.enum(["1", "2"]).optional(),
});

export const Route = createFileRoute(
  "/_authenticated/report/history/$reportType/$reportId",
)({
  parseParams: (params) => paramsSchema.parse(params),
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search: { version } }) => ({ version }),
  loader: async ({
    params: { reportType, reportId },
    deps: { version },
    context: { queryClient },
  }) => {
    if (reportType === "weekly") {
      await queryClient.ensureQueryData(weeklyReportDetailOptions(reportId));
      return;
    }

    if (version === "1") {
      await queryClient.ensureQueryData(monthlyReportV1DetailOptions(reportId));
      return;
    }

    await queryClient.ensureQueryData(monthlyReportV2DetailOptions(reportId));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { reportType, reportId } = Route.useParams();
  const { version } = Route.useSearch();

  if (reportType === "weekly") {
    return <WeeklyReportDetail reportId={reportId} />;
  }

  if (version === "1") {
    return <MonthlyReportV1Detail reportId={reportId} />;
  }

  return <MonthlyReportV2Detail reportId={reportId} />;
}

function WeeklyReportDetail({ reportId }: { reportId: number }) {
  const { data: report } = useSuspenseQuery(
    weeklyReportDetailOptions(reportId),
  );

  return (
    <LegacyReportDetail
      label={REPORT_CONFIGS.weekly.label}
      periodLabel={`${report.month}월 ${report.weekOfMonth}주차 리포트`}
      report={report}
    />
  );
}

function MonthlyReportV1Detail({ reportId }: { reportId: number }) {
  const { data: report } = useSuspenseQuery(
    monthlyReportV1DetailOptions(reportId),
  );

  return (
    <LegacyReportDetail
      label={REPORT_CONFIGS.monthly.label}
      periodLabel={`${report.month}월 리포트`}
      report={report}
    />
  );
}

function LegacyReportDetail({
  label,
  periodLabel,
  report,
}: {
  label: string;
  periodLabel: string;
  report: WeeklyReport | MonthlyReportV1;
}) {
  const comments = splitSegmentsBySentence(
    report.content?.improve?.segments ?? [],
  );

  useEffect(() => {
    if (report.status && report.status !== "COMPLETED") {
      useModalStore
        .getState()
        .showError("리포트를 생성하는 중이에요.", "조금만 기다려 주세요.");
    }
  }, [report.status]);

  return (
    <>
      <SubHeader>{label}</SubHeader>
      <Container>
        <div className="flex-1 flex flex-col">
          <div className="-mx-padding-x-m px-padding-x-m flex flex-col items-center justify-center gap-margin-y-s bg-[url(/periodic-report-bg.png)] bg-cover h-[calc((150/796)*100*var(--dvh))]">
            <span className="text-caption-m text-text-secondary">
              {periodLabel}
            </span>
            {/* eslint-disable react/no-unescaped-entities */}
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
        </div>
      </Container>
    </>
  );
}

function MonthlyReportV2Detail({ reportId }: { reportId: number }) {
  const { data: report } = useSuspenseQuery(
    monthlyReportV2DetailOptions(reportId),
  );

  useEffect(() => {
    if (report.status && report.status !== "COMPLETED") {
      useModalStore
        .getState()
        .showError("리포트를 생성하는 중이에요.", "조금만 기다려 주세요.");
    }
  }, [report.status]);

  return (
    <>
      <SubHeader>월간 리포트 v2</SubHeader>
      <Container hasScroll={true} className="min-h-0">
        <div className="flex-1 min-h-0 flex flex-col">
          <MonthlyReportV2Slides report={report} />
        </div>
      </Container>
    </>
  );
}
