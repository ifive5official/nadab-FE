// 유형 리포트 전체 가져오기(폴링 포함)
import { useSuspenseQuery } from "@tanstack/react-query";
import { typeReportOptions } from "../quries";

export default function useTypeReport() {
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

  return {
    reports,
  };
}
