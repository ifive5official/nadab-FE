import { useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { MonthlyReportV2Slides } from "@/features/report/monthly-v2/MonthlyReportV2Slides";
import {
  monthlyReportV2DetailOptions,
  monthlyReportV2Options,
} from "@/features/report/quries";
import type { components } from "@/generated/api-types";
import useModalStore from "@/store/modalStore";

type MonthlyReportLocator =
  components["schemas"]["MonthlyReportLocatorResponse"];

const paramsSchema = z.object({
  period: z.enum(["current", "previous"]),
});

export const Route = createFileRoute(
  "/_authenticated/report/monthly-v2/$period",
)({
  component: RouteComponent,
  parseParams: (params) => paramsSchema.parse(params),
  loader: async ({ params: { period }, context: { queryClient } }) => {
    const reports = await queryClient.ensureQueryData(monthlyReportV2Options);
    const locator =
      period === "previous" ? reports.previousReport : reports.report;

    if (getReportVersion(locator) === "2" && locator?.reportId) {
      await queryClient.ensureQueryData(
        monthlyReportV2DetailOptions(locator.reportId),
      );
    }
  },
});

function RouteComponent() {
  const { period } = Route.useParams();
  const navigate = useNavigate();
  const { data: reports } = useSuspenseQuery(monthlyReportV2Options);
  const locator =
    period === "previous" ? reports.previousReport : reports.report;

  if (!isV2Locator(locator)) {
    return (
      <InvalidMonthlyReportV2 onClose={() => navigate({ to: "/report" })} />
    );
  }

  return <MonthlyReportV2Detail reportId={locator.reportId} period={period} />;
}

function InvalidMonthlyReportV2({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    useModalStore
      .getState()
      .showError("리포트를 불러올 수 없어요.", "다시 시도해주세요.");
    onClose();
  }, [onClose]);

  return (
    <>
      <SubHeader>월간 리포트 v2</SubHeader>
      <Container>{null}</Container>
    </>
  );
}

function MonthlyReportV2Detail({
  reportId,
  period,
}: {
  reportId: number;
  period: "current" | "previous";
}) {
  const { data: report } = useSuspenseQuery(
    monthlyReportV2DetailOptions(reportId),
  );
  const navigate = useNavigate();
  const { data: reports } = useSuspenseQuery(monthlyReportV2Options);
  const nextLocator =
    period === "current" ? reports.previousReport : reports.report;
  const nextLabel =
    period === "current" ? "이전 월간 리포트 보기" : "지난달 월간 리포트 보기";

  const goToLocator = () => {
    if (!nextLocator) {
      useModalStore.getState().showError("이전 리포트가\n존재하지 않아요.");
      return;
    }

    const version = getReportVersion(nextLocator);

    if (version === "1") {
      navigate({
        to: `/report/monthly/${period === "current" ? "previous" : "current"}`,
      });
      return;
    }

    if (version === "2") {
      navigate({
        to: `/report/monthly-v2/${period === "current" ? "previous" : "current"}`,
      });
    }
  };

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
          <button
            className="shrink-0 text-button-2 text-brand-primary py-padding-y-m"
            onClick={goToLocator}
          >
            {nextLabel}
          </button>
        </div>
      </Container>
    </>
  );
}

function isV2Locator(
  locator: MonthlyReportLocator | undefined,
): locator is MonthlyReportLocator & { reportId: number; version: "2" } {
  return (
    getReportVersion(locator) === "2" && typeof locator?.reportId === "number"
  );
}

function getReportVersion(locator: MonthlyReportLocator | undefined) {
  return String(locator?.version ?? "");
}
