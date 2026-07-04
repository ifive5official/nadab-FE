import MonthlyEmotionRadarChart from "@/features/report/MonthlyEmotionRadarChart";
import { StyledSegments } from "@/features/report/ReportComponents";
import { ReportSectionHeader, SurfaceCard } from "./LayoutPrimitives";
import type { MonthlyReportV2 } from "./types";
import { formatPercent, normalizeSegments } from "./utils";

export function EmotionSection({ report }: { report: MonthlyReportV2 }) {
  const emotions = report.emotionStats?.emotions ?? [];
  const comparison = report.emotionComparison;
  const previousEmotions = comparison?.previousEmotionStats?.emotions ?? [];
  const showComparison =
    report.comparisonType === "COMPARISON" && previousEmotions.length > 0;
  const dominantEmotion = emotions[0];
  const emotionSummaryTitle =
    report.comparisonType === "COMPARISON"
      ? "지난 기간과 비교해"
      : `${report.month ?? "-"}월의 감정을 살펴보면`;

  return (
    <section className="flex flex-col gap-gap-y-l">
      <ReportSectionHeader
        caption={`${report.month}월의 감정 통계`}
        title="이번 달의 감정은 어땠을까요?"
      />
      <MonthlyEmotionRadarChart
        emotions={emotions}
        previousEmotions={previousEmotions}
        showComparison={showComparison}
        currentMonth={report.month}
        previousMonth={comparison?.previousMonth}
      />
      <div className="grid grid-cols-2 grid-rows-2 gap-gap-y-s gap-gap-x-s">
        <SummaryMetricCard
          label="긍정적인 감정 비율"
          value={formatPercent(report.emotionStats?.positivePercent)}
        />
        <SurfaceCard className="row-span-2 allow-copy">
          <p className="mb-gap-y-s text-label-m text-text-secondary break-keep">
            {emotionSummaryTitle}
          </p>
          <p className="text-body-2">
            <StyledSegments
              segments={normalizeSegments(
                report.emotionSummaryContent?.styledText?.segments,
              )}
              type="mix"
            />
          </p>
        </SurfaceCard>
        <SummaryMetricCard
          label="가장 많이 나타난 감정"
          value={dominantEmotion?.emotionName ?? "-"}
        />
      </div>
    </section>
  );
}

function SummaryMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <SurfaceCard className="flex min-h-24 flex-col justify-between">
      <span className="text-caption-m text-text-secondary break-keep">
        {label}
      </span>
      <div>
        <p className="text-headline-s text-text-primary">{value}</p>
      </div>
    </SurfaceCard>
  );
}
