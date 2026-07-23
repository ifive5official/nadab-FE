import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmotionSection } from "./EmotionSection";
import type { MonthlyReportV2 } from "./types";

// 긍정 감정 비율에 따른 하단 카드 배치를 확인할 리포트를 만듭니다.
function reportWithPositivePercent(positivePercent: number): MonthlyReportV2 {
  return {
    month: 7,
    comparisonType: "BASELINE",
    emotionStats: {
      positivePercent,
      emotions: [{ emotionName: "기쁨", count: 10 }],
    },
  };
}

describe("EmotionSection", () => {
  it("uses the dominant keyword and emotion trend as a two-line title when both exist", () => {
    const report = reportWithPositivePercent(50);
    report.dominantKeyword = "평온";
    report.emotionTrend = "긍정 감정이 늘었어요";
    const markup = renderToStaticMarkup(<EmotionSection report={report} />);

    expect(markup).toContain("평온를 중심으로<br/>긍정 감정이 늘었어요");
    expect(markup).not.toContain("이번 달의 감정은 어땠을까요?");
  });

  it("keeps the default title when either title field is missing", () => {
    const report = reportWithPositivePercent(50);
    report.dominantKeyword = "평온";
    const markup = renderToStaticMarkup(<EmotionSection report={report} />);

    expect(markup).toContain("이번 달의 감정은 어땠을까요?");
    expect(markup).not.toContain("평온를 중심으로");
  });

  it("hides the positive emotion card below 10 percent and moves the dominant emotion card up", () => {
    const markup = renderToStaticMarkup(
      <EmotionSection report={reportWithPositivePercent(9)} />,
    );

    expect(markup).not.toContain("긍정적인 감정 비율");
    expect(markup).toContain("가장 많이 나타난 감정");
    expect(markup.indexOf("가장 많이 나타난 감정")).toBeLessThan(
      markup.indexOf("7월의 감정을 살펴보면"),
    );
  });

  it("shows the positive emotion card from 10 percent", () => {
    const markup = renderToStaticMarkup(
      <EmotionSection report={reportWithPositivePercent(10)} />,
    );

    expect(markup).toContain("긍정적인 감정 비율");
  });

  it("uses a smaller value font only when positive emotion reaches 100 percent", () => {
    const ninetyNinePercentMarkup = renderToStaticMarkup(
      <EmotionSection report={reportWithPositivePercent(99)} />,
    );
    const oneHundredPercentMarkup = renderToStaticMarkup(
      <EmotionSection report={reportWithPositivePercent(100)} />,
    );

    expect(ninetyNinePercentMarkup).toContain(
      '<p class="text-headline-s text-text-primary">99%</p>',
    );
    expect(oneHundredPercentMarkup).toContain(
      '<p class="text-title-1 text-text-primary">100%</p>',
    );
  });

  it("uses the evenly distributed message in the dominant emotion card when at least three emotions share the highest count", () => {
    const report = reportWithPositivePercent(50);
    report.emotionStats!.emotions = [
      { emotionName: "기쁨", count: 5 },
      { emotionName: "평온", count: 5 },
      { emotionName: "설렘", count: 5 },
      { emotionName: "슬픔", count: 2 },
    ];
    const markup = renderToStaticMarkup(<EmotionSection report={report} />);

    expect(markup).toContain("이번 달의 감정은 어땠을까요?");
    expect(markup).toContain(
      '<p class="text-label-s break-keep text-text-primary">이번 달은 감정이 고르게 나타났어요.</p>',
    );
    expect(markup).not.toContain(">기쁨</p>");
  });

  it("keeps the dominant emotion name when fewer than three emotions share the highest count", () => {
    const report = reportWithPositivePercent(50);
    report.emotionStats!.emotions = [
      { emotionName: "기쁨", count: 5 },
      { emotionName: "평온", count: 5 },
      { emotionName: "설렘", count: 2 },
    ];
    const markup = renderToStaticMarkup(<EmotionSection report={report} />);

    expect(markup).toContain("이번 달의 감정은 어땠을까요?");
    expect(markup).not.toContain("이번 달은 감정이 고르게 나타났어요.");
    expect(markup).toContain(">기쁨</p>");
  });

  it("does not treat missing emotion counts as a shared highest count", () => {
    const report = reportWithPositivePercent(50);
    report.emotionStats!.emotions = [
      { emotionName: "기쁨" },
      { emotionName: "평온" },
      { emotionName: "설렘" },
    ];
    const markup = renderToStaticMarkup(<EmotionSection report={report} />);

    expect(markup).toContain("이번 달의 감정은 어땠을까요?");
  });

  it("limits only the left metric rows to a height between 96px and 112px", () => {
    const markup = renderToStaticMarkup(
      <EmotionSection report={reportWithPositivePercent(10)} />,
    );

    expect(markup).toContain("auto-rows-[minmax(6rem,7rem)]");
    expect(markup).toContain("grid grid-cols-2 items-start");
  });
});
