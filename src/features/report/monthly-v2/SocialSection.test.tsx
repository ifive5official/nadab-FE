import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SocialSection } from "./SocialSection";
import type { MonthlyReportV2 } from "./types";

describe("SocialSection", () => {
  it("shows tie-aware rank values instead of display order", () => {
    const report: MonthlyReportV2 = {
      month: 7,
      socialSummary: {
        visible: true,
        month: 7,
        likeRanking: [
          { displayOrder: 1, rank: 1, userId: 1, nickname: "가영" },
          { displayOrder: 2, rank: 1, userId: 2, nickname: "나영" },
          { displayOrder: 3, rank: 3, userId: 3, nickname: "다영" },
        ],
      },
    };
    const markup = renderToStaticMarkup(<SocialSection report={report} />);
    const displayedRanks = Array.from(
      markup.matchAll(
        /<span class="w-5 text-button-1 text-brand-primary">(\d+)<\/span>/g,
      ),
      (match) => Number(match[1]),
    );

    expect(displayedRanks).toEqual([1, 1, 3]);
  });

  it("falls back to display order when rank is missing", () => {
    const report: MonthlyReportV2 = {
      month: 7,
      socialSummary: {
        visible: true,
        month: 7,
        likeRanking: [
          { displayOrder: 2, userId: 1, nickname: "가영" },
        ],
      },
    };
    const markup = renderToStaticMarkup(<SocialSection report={report} />);

    expect(markup).toContain(
      '<span class="w-5 text-button-1 text-brand-primary">2</span>',
    );
  });
});
