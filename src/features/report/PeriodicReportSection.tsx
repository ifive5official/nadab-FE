import { Badge } from "@/components/Badges";
import BlockButton from "@/components/BlockButton";
import { InfoIcon, LoadingSpinnerIcon } from "@/components/Icons";
import { api } from "@/lib/axios";
import type { ApiResponse, ApiErrResponse } from "@/generated/api";
import { useQuery } from "@tanstack/react-query";
import type { components } from "@/generated/api-types";
import { AxiosError } from "axios";
import { crystalsOptions } from "../user/quries";
import { useGenerateWeeklyReportMutation } from "./useGenerateWeeklyReportMutation";
import { getPreviousPeriodText } from "@/lib/getPrevPeriod";
import { useState } from "react";
import { Popover } from "@/components/Popover";
// import Toast from "@/components/Toast";

type weeklyReportRes = components["schemas"]["WeeklyReportResponse"];

export function PeriodicReport() {
  const { data: crystalBalance } = useQuery(crystalsOptions);
  const {
    data: weeklyReport,
    error: weeklyReportErr,
    isLoading: isWeeklyReportLoading,
  } = useQuery<weeklyReportRes, AxiosError<ApiErrResponse<null>>>({
    queryKey: ["currentUser", "weeklyReport"],
    queryFn: async () => {
      // 주간 레포트 조회
      const res = await api.get<ApiResponse<weeklyReportRes>>(
        "/api/v1/weekly-report"
      );
      return res.data.data!;
    },
    retry: (_, error) => {
      if (
        error.response?.data?.code === "USER_NOT_FOUND" ||
        error.response?.data?.code === "WEEKLY_REPORT_NOT_FOUND"
      )
        return false;
      return true;
    },
    // 레포트 생성 중일 경우 0.5초 간격으로 폴링
    refetchInterval: (query) => {
      const error = query.state.error as AxiosError<ApiErrResponse<null>>;
      if (error?.response?.data?.code === "WEEKLY_REPORT_NOT_COMPLETED") {
        return 500;
      }

      return false;
    },
  });

  // const [isToastOpen, setIsToastOpen] = useState(false);
  // const [toastMessage, setToastMessage] = useState("");

  const generateWeeklyReportMutation = useGenerateWeeklyReportMutation({
    // onSuccess: () => {
    //   setIsToastOpen(true);
    //   setToastMessage("30 크리스탈이 소진되었어요.");
    // },
  });
  const isGenerating =
    generateWeeklyReportMutation.isPending ||
    weeklyReportErr?.response?.data.code === "WEEKLY_REPORT_NOT_COMPLETED";

  // const deleteWeeklyReportMutation = useMutation({
  //   mutationFn: async () => {
  //     const res = api.post("/api/v1/test/delete/weekly-report");
  //     return res;
  //   },
  // });

  return (
    <>
      {/* <button onClick={() => deleteWeeklyReportMutation.mutate()}>삭제</button> */}
      <div className="py-padding-y-m flex flex-col gap-gap-y-l">
        {isWeeklyReportLoading ? (
          <PeriodicReportSectionSkeleton />
        ) : (
          <PeriodicReportSection
            reportType="weekly"
            report={weeklyReport}
            onGenerate={() => generateWeeklyReportMutation.mutate()}
            isGenerating={isGenerating}
            cost={30}
            crystalBalance={crystalBalance?.crystalBalance ?? 0}
          />
        )}
        {isWeeklyReportLoading ? (
          <PeriodicReportSectionSkeleton />
        ) : (
          <PeriodicReportSection
            reportType="monthly"
            report={undefined}
            onGenerate={() => {}}
            isGenerating={false}
            cost={200}
            crystalBalance={crystalBalance?.crystalBalance ?? 0}
          />
        )}
      </div>
      {/* <Toast
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
        message={toastMessage}
      /> */}
    </>
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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const config = {
    weekly: {
      label: "주간 분석",
      periodText: "지난주",
      title: `${report?.month}월 ${report?.weekOfMonth}주차 분석`,
      requiredAnswers: 3,
      prevBtnText: `${getPreviousPeriodText("weekly")} 분석 보기`,
    },
    monthly: {
      label: "월간 분석",
      periodText: "지난달",
      title: `${report?.month}월 분석`,
      requiredAnswers: 20,
      prevBtnText: `${getPreviousPeriodText("monthly")} 분석 보기`,
    },
  }[reportType];

  if (report) {
    return (
      <section className="px-padding-x-m pt-padding-y-m pb-padding-y-xl bg-surface-layer-1 rounded-2xl shadow-2">
        <div className="relative flex justify-between">
          <h3 className="text-title-2">{config.title}</h3>
          <InfoButton onClick={() => setIsPopoverOpen(true)} />
          <div className="absolute z-1 top-full w-full mt-margin-y-m flex justify-center">
            <Popover
              isOpen={isPopoverOpen}
              onClose={() => setIsPopoverOpen(false)}
            />
          </div>
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

  if (isGenerating) {
    return (
      <div className="fixed z-30 inset-0 sm:mx-auto sm:w-[412px] bg-surface-base">
        <div className="absolute inset-0 bg-[url(/background.png)] bg-cover opacity-60 dark:opacity-70" />
        <div className="relative h-full flex flex-col gap-margin-y-xxl items-center justify-center text-center">
          <LoadingSpinnerIcon />
          <div>
            <p className="text-title-2">
              현재 주간 리포트를
              <br />
              생성 중이에요.
            </p>
            <p className="text-body-2 mt-margin-y-s">
              곧 완성될 거예요. 조금만 기다려주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }
  // 레포트 없음
  return (
    <section className="px-margin-x-l py-margin-y-xl bg-surface-layer-1 rounded-2xl shadow-2">
      <div className="flex flex-col gap-margin-y-m mb-padding-y-xxl">
        <div className="relative flex justify-between items-center">
          <Badge>{config.label}</Badge>
          <InfoButton onClick={() => setIsPopoverOpen(true)} />
          <div className="absolute z-1 top-full w-full mt-margin-y-m flex justify-center">
            <Popover
              isOpen={isPopoverOpen}
              onClose={() => setIsPopoverOpen(false)}
            />
          </div>
        </div>
        <h3 className="text-title-2">
          {config.periodText} 리포트를 받아볼까요?
        </h3>
        <p className="text-caption-l">
          {config.periodText}에 답변을 {config.requiredAnswers}건 이상
          작성했다면 리포트를 생성할 수 있어요. {config.periodText} 리포트로
          나를 되돌아보세요.
        </p>
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
          {cost} 크리스탈로 받기
        </BlockButton>
      </div>
    </section>
  );
}

function InfoButton({ onClick }: { onClick: () => void }) {
  return (
    <>
      <button
        onClick={onClick}
        className="bg-button-tertiary-bg-default border border-button-tertiary-border-default rounded-lg px-padding-x-xs py-padding-y-xxs flex items-center gap-gap-x-xs"
      >
        <InfoIcon />
        <span className="text-caption-s text-interactive-border-info">
          더 알아보기
        </span>
      </button>
    </>
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

function PeriodicReportSectionSkeleton() {
  return (
    <section className="px-margin-x-l py-margin-y-xl bg-surface-layer-1 animate-pulse rounded-2xl shadow-2">
      <div className="flex flex-col gap-margin-y-m mb-padding-y-xxl invisible">
        <div className="relative flex justify-between items-center">
          <Badge>임시 텍스트</Badge>
          <InfoButton onClick={() => {}} />
        </div>

        <h3 className="text-title-2">지난달 리포트를 받아볼까요?</h3>
        <p className="text-caption-l">
          지난주에 답변을 3건 이상 작성했다면 리포트를 생성할 수 있어요. 지난주
          리포트로 나를 되돌아보세요.
        </p>
      </div>
      <div className="flex gap-gap-x-xs invisible">
        <BlockButton disabled={true} variant="secondary">
          이전 분석 보기
        </BlockButton>
        <BlockButton>0 크리스탈로 받기</BlockButton>
      </div>
    </section>
  );
}
