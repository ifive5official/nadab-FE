// 이전 리포트 보기 페이지
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { periodicReportOptions } from "@/features/report/quries";
import BlockButton from "@/components/BlockButton";
import useErrorStore from "@/store/modalStore";
import { REPORT_CONFIGS } from "@/features/report/reportConfigs";
import { getPreviousPeriodText } from "@/lib/getPrevPeriod";
import useModalStore from "@/store/modalStore";
import { splitSegmentsBySentence } from "@/features/report/splitSegmentsBySentence";
import SpeechBalloon from "@/components/Speechballoon";
import type { components } from "@/generated/api-types";

type weeklyReportsRes = components["schemas"]["WeeklyReportResponse"];

const reportTypeSchema = z.object({
  reportType: z.enum(["weekly", "monthly"]),
  period: z.enum(["previous", "current"]),
});

export const Route = createFileRoute(
  "/_authenticated/report/$reportType/$period",
)({
  component: RouteComponent,
  parseParams: (params) => reportTypeSchema.parse(params),
  loader: async ({ params: { reportType }, context: { queryClient } }) => {
    queryClient.ensureQueryData(periodicReportOptions(reportType));
  },
});

function RouteComponent() {
  const { showError } = useModalStore();
  const { reportType, period } = Route.useParams();
  const config = REPORT_CONFIGS[reportType];
  const { data: reports } = useSuspenseQuery(periodicReportOptions(reportType));
  const prevReport = reports.previousReport;
  const currentReport = reports.report;
  const report = (
    period === "previous" ? prevReport : currentReport
  ) as weeklyReportsRes; // 지금 보고 있는 리포트
  const BTN_CONFIG = {
    current: {
      // 이번주 리포트 보고 있으면
      label: `${getPreviousPeriodText(reportType, "prev")} 리포트 보기`,
      variant: prevReport ? "secondary" : "disabled",
      onclick: () => {
        if (prevReport) {
          navigate({ to: `/report/${reportType}/previous` });
        } else {
          showError("이전 리포트가\n존재하지 않아요.");
        }
      },
    },
    previous: {
      // 저번주 리포트 보고 있으면
      label: `${getPreviousPeriodText(reportType, "current")} 리포트 보기`,
      variant: currentReport ? "primary" : "disabled",
      onclick: () => {
        if (currentReport) {
          navigate({ to: `/report/${reportType}/current` });
        } else {
          showError(`다음 리포트가\n완성되지 못했어요.`);
        }
      },
    },
  } as const;

  const comments = splitSegmentsBySentence(
    report?.content?.improve?.segments ?? [],
  );
  const navigate = useNavigate();
  //   Todo: 에러 처리 보완
  useEffect(() => {
    if (!report) {
      useErrorStore.getState().showError("리포트를 불러올 수 없어요.");
    }
  }, [report]);

  return (
    <>
      <SubHeader>{config.label}</SubHeader>
      <Container>
        <div className="flex-1 flex flex-col">
          <div className="-mx-padding-x-m flex flex-col items-center justify-center gap-margin-y-s bg-[url(/periodic-report-bg.png)] bg-cover h-[calc((150/796)*100dvh)]">
            <span className="text-caption-m text-text-secondary">
              {report?.month}월{" "}
              {reportType === "weekly" && `${report?.weekOfMonth}주차 `}리포트
            </span>
            {/* eslint-disable react/no-unescaped-entities */}
            <span className="text-title-2">
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
              <div className="text-body-2 bg-surface-layer-1 border border-border-base rounded-xl px-padding-x-m py-padding-y-m">
                {report?.content?.discovered?.segments?.map((segment, i) => {
                  if (segment.marks!.length > 0) {
                    return (
                      <span
                        key={i}
                        className="font-bold! bg-[linear-gradient(transparent_50%,var(--color-brand-primary-alpha-10)_50%)] dark:bg-[linear-gradient(transparent_50%,var(--color-brand-primary-alpha-50)_50%)]"
                      >
                        {segment.text}
                      </span>
                    );
                  } else {
                    return segment.text;
                  }
                })}
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
              <div className="flex flex-col gap-gap-y-l px-padding-x-m">
                {comments?.map((comment, i) => (
                  <SpeechBalloon
                    key={i}
                    textColor="var(--color-text-primary)"
                    bgColor="var(--color-surface-layer-1)"
                  >
                    {comment?.map((segment, i) => {
                      if (segment.marks!.length > 0) {
                        return (
                          <span key={i} className="font-bold!">
                            {segment.text}
                          </span>
                        );
                      } else {
                        return segment.text;
                      }
                    })}
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
