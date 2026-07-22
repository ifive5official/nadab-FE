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

  it("limits only the left metric rows to a height between 96px and 112px", () => {
    const markup = renderToStaticMarkup(
      <EmotionSection report={reportWithPositivePercent(10)} />,
    );

    expect(markup).toContain("auto-rows-[minmax(6rem,7rem)]");
    expect(markup).toContain("grid grid-cols-2 items-start");
  });
});
