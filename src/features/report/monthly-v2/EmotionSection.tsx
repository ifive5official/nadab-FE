import MonthlyEmotionRadarChart from "@/features/report/MonthlyEmotionRadarChart";
import { StyledSegments } from "@/features/report/ReportComponents";
import { AppIcon } from "@/components/AppIcon";
import clsx from "clsx";
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
  const positivePercentPointChange =
    showComparison && typeof comparison?.positivePercentPointChange === "number"
      ? comparison.positivePercentPointChange
      : undefined;
  const positivePercent = report.emotionStats?.positivePercent;
  const showPositivePercentCard =
    typeof positivePercent !== "number" || positivePercent >= 10;

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
      <div className="grid grid-cols-2 items-start gap-gap-x-s">
        <div className="grid auto-rows-[minmax(6rem,7rem)] gap-gap-y-s">
          {showPositivePercentCard && (
            <SummaryMetricCard
              label="긍정적인 감정 비율"
              value={formatPercent(positivePercent)}
              valueClassName={
                positivePercent === 100 ? "text-title-1" : undefined
              }
              badgeValue={positivePercentPointChange}
              badgeTone={getPercentPointChangeTone(positivePercentPointChange)}
            />
          )}
          <SummaryMetricCard
            label="가장 많이 나타난 감정"
            value={dominantEmotion?.emotionName ?? "-"}
          />
        </div>
        <SurfaceCard className="allow-copy">
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
      </div>
    </section>
  );
}

function SummaryMetricCard({
  label,
  value,
  valueClassName,
  badgeValue,
  badgeTone = "neutral",
}: {
  label: string;
  value: string;
  valueClassName?: string;
  badgeValue?: number;
  badgeTone?: "positive" | "negative" | "neutral";
}) {
  return (
    <SurfaceCard className="flex min-h-24 flex-col justify-between">
      <span className="text-caption-m text-text-secondary break-keep">
        {label}
      </span>
      <div className="flex items-center gap-gap-x-xs">
        <p
          className={clsx(
            valueClassName ?? "text-headline-s",
            "text-text-primary",
          )}
        >
          {value}
        </p>
        {typeof badgeValue === "number" && (
          <PercentPointBadge value={badgeValue} tone={badgeTone} />
        )}
      </div>
    </SurfaceCard>
  );
}

function PercentPointBadge({
  value,
  tone,
}: {
  value: number;
  tone: "positive" | "negative" | "neutral";
}) {
  const iconName =
    tone === "positive"
      ? "arrow-up-filled"
      : tone === "negative"
        ? "arrow-down-filled"
        : undefined;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-gap-x-xs rounded-full border px-padding-x-xs py-padding-y-xxs text-button-3",
        {
          "border-brand-primary text-brand-primary": tone === "positive",
          "border-text-tertiary text-text-tertiary": tone === "neutral",
          "border-feedback-error-fg text-feedback-error-fg": tone === "negative",
        },
      )}
    >
      {Math.abs(value)}%p
      {iconName && <AppIcon name={iconName} size={12} color="current" />}
    </span>
  );
}

function getPercentPointChangeTone(value: number | undefined) {
  if (typeof value !== "number" || value === 0) return "neutral";
  return value > 0 ? "positive" : "negative";
}
