import { useEffect } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import useModalStore from "@/store/modalStore";
import { monthlyReportV2Options } from "../quries";

const GENERATING_STATUSES = ["PENDING", "IN_PROGRESS", "TEXT_COMPLETED"];

export function isMonthlyReportV2Generating(status: string | undefined) {
  return GENERATING_STATUSES.includes(status ?? "");
}

export default function useMonthlyReportV2() {
  const queryClient = useQueryClient();
  const { data: reports } = useSuspenseQuery({
    ...monthlyReportV2Options,
    refetchInterval: (query) => {
      const status = query.state.data?.report?.status;
      if (isMonthlyReportV2Generating(status)) {
        return 1000;
      }
      return false;
    },
  });

  const status = reports?.report?.status;

  useEffect(() => {
    if (status === "FAILED") {
      useModalStore
        .getState()
        .showError(
          "월간 리포트 v2 생성 도중 문제가 발생했어요.",
          "다시 시도해주세요. 사용한 크리스탈은 환불되었어요.",
        );
      queryClient.invalidateQueries({
        queryKey: monthlyReportV2Options.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: ["currentUser", "crystals"],
      });
    }
  }, [status, queryClient]);

  return {
    report: reports?.report?.status !== "FAILED" ? reports?.report : undefined,
    prevReport:
      reports?.previousReport?.status !== "FAILED"
        ? reports?.previousReport
        : undefined,
    isGenerating: isMonthlyReportV2Generating(status),
  };
}
