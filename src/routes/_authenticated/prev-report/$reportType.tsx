// 이전 레포트 보기 페이지
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import PeriodicReport from "@/features/report/PeriodicReport";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { periodicReportOptions } from "@/features/report/quries";
import BlockButton from "@/components/BlockButton";
import useErrorStore from "@/store/errorStore";
import { crystalsOptions } from "@/features/user/quries";
import { REPORT_CONFIGS } from "@/features/report/reportConfigs";
import { getPreviousPeriodText } from "@/lib/getPrevPeriod";
import { useGeneratePeriodicReportMutation } from "@/features/report/hooks/useGeneratePeriodicReportMutation";

const reportTypeSchema = z.object({
  reportType: z.enum(["weekly", "monthly"]),
});

export const Route = createFileRoute("/_authenticated/prev-report/$reportType")(
  {
    component: RouteComponent,
    parseParams: (params) => reportTypeSchema.parse(params),
    loader: async ({ params: { reportType }, context: { queryClient } }) => {
      queryClient.ensureQueryData(periodicReportOptions(reportType));
    },
  },
);

function RouteComponent() {
  const { reportType } = Route.useParams();
  const config = REPORT_CONFIGS[reportType];
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { data: crystals } = useSuspenseQuery(crystalsOptions);
  const crystalBalance = crystals.crystalBalance ?? 0;
  const { data: reports } = useSuspenseQuery(periodicReportOptions(reportType));
  const generateReportMutation = useGeneratePeriodicReportMutation({
    reportType,
    onSuccess: () => {
      navigate({ to: "/report" });
    },
  });
  const navigate = useNavigate();
  //   Todo: 에러 처리 보완
  useEffect(() => {
    if (!reports.previousReport) {
      useErrorStore.getState().showError("이전 레포트를 불러올 수 없어요.");
    }
  }, [reports.previousReport]);

  return (
    <>
      <SubHeader>이전 분석 보기</SubHeader>
      <Container>
        {reports.previousReport && (
          <div className="py-padding-y-m flex flex-col gap-gap-y-xl">
            <PeriodicReport
              variant="prev"
              reportType={reportType}
              prevReport={undefined}
              report={reports.previousReport}
              isPopoverOpen={isPopoverOpen}
              setIsPopoverOpen={setIsPopoverOpen}
            />
            <BlockButton
              disabled={!!(crystalBalance < config.cost)}
              onClick={() => {
                if (reports.report) {
                  navigate({ to: "/report" });
                } else {
                  generateReportMutation.mutate();
                }
              }}
            >
              {reports.report
                ? `${getPreviousPeriodText(reportType, "current")} 분석 보기`
                : `${config.cost} 크리스탈로 ${getPreviousPeriodText(reportType, "current")} 분석 받기`}
            </BlockButton>
          </div>
        )}
      </Container>
    </>
  );
}
