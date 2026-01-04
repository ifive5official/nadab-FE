import { Badge } from "@/components/Badges";
import BlockButton from "@/components/BlockButton";
import { InfoIcon } from "@/components/Icons";
import { api } from "@/lib/axios";
import type { ApiResponse, ApiErrResponse } from "@/generated/api";
import { useQuery } from "@tanstack/react-query";
import type { components } from "@/generated/api-types";
import { AxiosError } from "axios";
import { crystalsOptions } from "../user/quries";
import { useGenerateWeeklyReportMutation } from "./useGenerateWeeklyReportMutation";
// import Toast from "@/components/Toast";
import { getPreviousPeriodText } from "@/lib/getPrevPeriod";

type weeklyReportRes = components["schemas"]["WeeklyReportResponse"];

export function PeriodicReport() {
  const { data: crystalBalance } = useQuery(crystalsOptions);
  const { data: weeklyReport, error: weeklyReportErr } = useQuery<
    weeklyReportRes,
    AxiosError<ApiErrResponse<null>>
  >({
    queryKey: ["currentUser", "weeklyReport"],
    queryFn: async () => {
      // 주간 레포트 조회
      const res = await api.get<ApiResponse<weeklyReportRes>>(
        "/api/v1/weekly-report"
      );
      return res.data.data!;
    },
    retry: (_, error) => {
      if (error.response?.status === 404) return false;
      return true;
    },
  });
  const generateWeeklyReportMutation = useGenerateWeeklyReportMutation({});
  const isGenerating =
    generateWeeklyReportMutation.isPending ||
    weeklyReportErr?.response?.data.code === "WEEKLY_REPORT_NOT_COMPLETED";

  return (
    <div className="py-padding-y-m flex flex-col gap-gap-y-l">
      <PeriodicReportSection
        reportType="weekly"
        report={weeklyReport}
        onGenerate={() => generateWeeklyReportMutation.mutate()}
        isGenerating={isGenerating}
        cost={30}
        crystalBalance={crystalBalance?.crystalBalance ?? 0}
      />
      <PeriodicReportSection
        reportType="monthly"
        report={undefined}
        onGenerate={() => {}}
        isGenerating={false}
        cost={200}
        crystalBalance={crystalBalance?.crystalBalance ?? 0}
      />
    </div>
  );
}

type PeriodicReportSectionProps = {
  reportType: "weekly" | "monthly";
  report: weeklyReportRes | undefined; // Todo: 월간 리포트도 받을 수 있게 변경
  onGenerate: () => void;
  cost: number;
  crystalBalance: number;
  isGenerating: boolean;
};

function PeriodicReportSection({
  reportType,
  report,
  onGenerate,
  cost,
  crystalBalance,
  isGenerating,
}: PeriodicReportSectionProps) {
  const config = {
    weekly: {
      label: "주간 분석",
      periodText: "지난주",
      title: `${report?.month}월 ${report?.weekOfMonth}주차 분석`,
      prevBtnText: `${getPreviousPeriodText("weekly")} 분석 보기`,
    },
    monthly: {
      label: "월간 분석",
      periodText: "지난달",
      title: `${report?.month}월 분석`,
      prevBtnText: `${getPreviousPeriodText("monthly")} 분석 보기`,
    },
  }[reportType];

  if (report) {
    return (
      <section className="px-padding-x-m pt-padding-y-m pb-padding-y-xl bg-surface-layer-1 rounded-2xl shadow-2">
        <div className="flex justify-between">
          <h3 className="text-title-2">{config.title}</h3>
          <InfoButton />
        </div>
        <div className="border-b border-b-surface-layer-2 my-gap-y-l" />
        <div className="flex flex-col gap-gap-y-xl">
          <ReportItem
            title="이런 면도 발견되었어요."
            content={report.discovered!}
          />
          <ReportItem title="이런 점이 좋았어요." content={report.good!} />
          <ReportItem
            title="다음엔 이렇게 보완해볼까요?"
            content={report.improve!}
          />
          <BlockButton variant="secondary" disabled={true}>
            {config.prevBtnText}
          </BlockButton>
        </div>
      </section>
    );
  }
  // 레포트 없거나 대기 중
  return (
    <>
      <section className="px-margin-x-l py-margin-y-xl bg-surface-layer-1 rounded-2xl shadow-2">
        <div className="flex flex-col gap-margin-y-m mb-padding-y-xxl">
          <div className="flex justify-between items-center">
            <Badge>{config.label}</Badge>
            <InfoButton />
          </div>
          {isGenerating ? (
            <>
              <h3 className="text-title-2">
                {config.periodText} 분석을 생성하는 중이에요.
              </h3>
              <p className="text-caption-l">
                조금만 기다려 주세요.
                <br />
                최대 1분 정도의 시간이 소요될 수 있어요.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-title-2">
                아직 {config.periodText} 기록을 분석하지 않았어요.
              </h3>
              <p className="text-caption-l">
                {config.periodText}에 답변을 3건 이상 작성했다면
                <br />
                크리스탈을 사용해서 분석을 받을 수 있어요.
              </p>
            </>
          )}
        </div>
        <div className="flex gap-gap-x-xs">
          <BlockButton disabled={true} variant="secondary">
            이전 분석 보기
          </BlockButton>
          <BlockButton
            isLoading={isGenerating}
            disabled={crystalBalance < cost}
            onClick={onGenerate}
          >
            {cost} 크리스탈로 보기
          </BlockButton>
        </div>
      </section>
    </>
  );
}

function InfoButton() {
  return (
    <button className="bg-button-tertiary-bg-default border border-button-tertiary-border-default rounded-lg px-padding-x-xs py-padding-y-xxs flex items-center gap-gap-x-xs">
      <InfoIcon />
      <span className="text-caption-s text-interactive-border-info">
        더 알아보기
      </span>
    </button>
  );
}

function ReportItem({ title, content }: { title: string; content: string }) {
  return (
    <div className="flex flex-col gap-gap-y-s text-text-secondary">
      <h4 className="text-label-l text-text-secondary">{title}</h4>
      <p className="text-body-2">{content}</p>
    </div>
  );
}
