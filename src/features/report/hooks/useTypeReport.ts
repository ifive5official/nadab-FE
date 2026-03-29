// 유형 리포트 전체 가져오기(폴링 포함)
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { typeReportOptions } from "../quries";
import { useEffect } from "react";
import type { components } from "@/generated/api-types";
import useModalStore from "@/store/modalStore";
import { findCategoryByCode } from "@/constants/categories";

type ReportDetail = components["schemas"]["TypeReportDetailResponse"];

export default function useTypeReport() {
  const { showError } = useModalStore();
  const queryClient = useQueryClient();

  // Todo: 에러 처리
  const { data } = useSuspenseQuery({
    ...typeReportOptions,
    // 리포트 생성 중일 경우 1초 간격으로 폴링
    refetchInterval: (query) => {
      const reports = query.state.data?.reports;
      if (!reports) {
        return false;
      }
      const isGenerating = Object.values(reports!).some(
        (report) => report?.generation?.status === "IN_PROGRESS",
      );
      if (isGenerating) {
        return 1000; // 1초마다 폴링
      }
      return false;
    },
  });

  const reports = data.reports;

  useEffect(() => {
    (Object.entries(reports!) as [string, ReportDetail][]).forEach(
      ([category, details]) => {
        if (details.generation?.status === "FAILED") {
          showError(
            `${findCategoryByCode(category)?.title} 리포트 생성 도중 문제가 발생했어요.`,
            "다시 시도해주세요. 사용한 크리스탈은 환불되었어요.",
          );
          queryClient.invalidateQueries({
            queryKey: ["currentUser", "crystals"],
          });
        }
      },
    );
  }, [queryClient, reports, showError]);

  return {
    reports,
  };
}
