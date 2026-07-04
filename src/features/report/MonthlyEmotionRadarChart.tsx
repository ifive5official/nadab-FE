import { findEmotionByCode } from "@/constants/emotions";
import type { components } from "@/generated/api-types";

type EmotionStat = components["schemas"]["EmotionStat"];

type Props = {
  emotions: EmotionStat[];
  previousEmotions?: EmotionStat[];
  showComparison?: boolean;
  currentMonth?: number;
  previousMonth?: number;
};

const VIEW_BOX_SIZE = 240;
const CENTER = VIEW_BOX_SIZE / 2;
const RADIUS = 78;
const GRID_STEPS = 4;

export default function MonthlyEmotionRadarChart({
  emotions,
  previousEmotions,
  showComparison = false,
  currentMonth,
  previousMonth,
}: Props) {
  const chartItems = emotions
    .filter((emotion) => typeof emotion.percent === "number")
    .map((emotion) => ({
      ...emotion,
      color: findEmotionByCode(emotion.emotionCode ?? "")?.color ?? "#D4D4D4",
      percent: emotion.percent ?? 0,
      name: emotion.emotionName ?? "기타",
    }));

  if (chartItems.length < 3) {
    return null;
  }

  const previousEmotionMap = new Map(
    (previousEmotions ?? []).map((emotion) => [
      emotion.emotionCode,
      emotion.percent ?? 0,
    ]),
  );
  const previousChartItems = chartItems.map((emotion) => ({
    emotionCode: emotion.emotionCode,
    percent: previousEmotionMap.get(emotion.emotionCode) ?? 0,
  }));
  const hasPreviousPolygon =
    showComparison && previousChartItems.some((emotion) => emotion.percent > 0);
  const maxPercent = Math.max(
    ...chartItems.map((emotion) => emotion.percent),
    ...previousChartItems.map((emotion) => emotion.percent),
    1,
  );
  const axisPoints = chartItems.map((_, index) =>
    getPoint(index, chartItems.length, RADIUS),
  );
  const valuePoints = chartItems.map((emotion, index) =>
    getPoint(index, chartItems.length, (emotion.percent / maxPercent) * RADIUS),
  );
  const previousValuePoints = previousChartItems.map((emotion, index) =>
    getPoint(index, chartItems.length, (emotion.percent / maxPercent) * RADIUS),
  );

  return (
    <div className="flex flex-col items-center gap-gap-y-l">
      <div className="relative w-full">
        <svg
          className="mx-auto aspect-square w-[min(260px,74vw)] overflow-visible"
          viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`}
          role="img"
          aria-label="월간 감정 비율 레이더 차트"
        >
          <g>
            {Array.from({ length: GRID_STEPS }, (_, index) => {
              const radius = (RADIUS / GRID_STEPS) * (index + 1);

              return (
                <circle
                  key={radius}
                  cx={CENTER}
                  cy={CENTER}
                  r={radius}
                  fill="none"
                  stroke="var(--color-border-base)"
                  strokeWidth="1"
                />
              );
            })}
            {axisPoints.map((point, index) => (
              <line
                key={chartItems[index].emotionCode ?? index}
                x1={CENTER}
                y1={CENTER}
                x2={point.x}
                y2={point.y}
                stroke="var(--color-border-base)"
                strokeWidth="1"
              />
            ))}
            <polygon
              points={valuePoints.map(formatPoint).join(" ")}
              fill="var(--color-brand-primary-alpha-10)"
              stroke="var(--color-brand-primary)"
              strokeWidth="2"
            />
            {hasPreviousPolygon && (
              <polygon
                points={previousValuePoints.map(formatPoint).join(" ")}
                fill="var(--color-report-comparison-alpha-10)"
                stroke="var(--color-report-comparison)"
                strokeDasharray="5 4"
                strokeWidth="2"
              />
            )}
          </g>
          {chartItems.map((emotion, index) => {
            const labelPoint = getPoint(index, chartItems.length, RADIUS + 24);
            return (
              <text
                key={emotion.emotionCode ?? emotion.name}
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-text-secondary text-[11px] font-semibold"
              >
                <tspan x={labelPoint.x} dy="-0.4em">
                  {emotion.name}
                </tspan>
                <tspan
                  x={labelPoint.x}
                  dy="1.3em"
                  className="fill-brand-primary"
                >
                  {emotion.percent}%
                </tspan>
              </text>
            );
          })}
        </svg>
      </div>
      <div className="flex w-full items-center justify-start gap-gap-x-l text-caption-m text-text-secondary">
        {hasPreviousPolygon && (
          <span className="flex items-center gap-gap-x-xs">
            <span className="h-2 w-2 rounded-full bg-[var(--color-report-comparison)]" />
            {formatMonthLabel(previousMonth, "지난 달")}
          </span>
        )}
        <span className="flex items-center gap-gap-x-xs">
          <span className="h-2 w-2 rounded-full bg-brand-primary" />
          {formatMonthLabel(currentMonth, "이번 달")}
        </span>
      </div>
    </div>
  );
}

function getPoint(index: number, total: number, radius: number) {
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / total;

  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

function formatPoint({ x, y }: { x: number; y: number }) {
  return `${x.toFixed(2)},${y.toFixed(2)}`;
}

function formatMonthLabel(month: number | undefined, fallback: string) {
  return typeof month === "number" ? `${month}월` : fallback;
}
