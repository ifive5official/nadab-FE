import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  getInterestDisplayState,
  InterestSection,
} from "./CommentInterestSections";
import type { InterestStat, MonthlyReportV2 } from "./types";

// 테스트에 사용할 선택 주제 통계 데이터를 만듭니다.
const interest = (interestName: string, count?: number): InterestStat => ({
  interestCode: interestName,
  interestName,
  count,
});

describe("getInterestDisplayState", () => {
  it("keeps the three-card podium order and emphasizes only first place", () => {
    const state = getInterestDisplayState([
      interest("1위", 3),
      interest("2위", 2),
      interest("3위", 1),
    ]);

    expect(state.cards.map(({ interest }) => interest.interestName)).toEqual([
      "2위",
      "1위",
      "3위",
    ]);
    expect(state.cards.map(({ isTopRank }) => isTopRank)).toEqual([
      false,
      true,
      false,
    ]);
    expect(state.layoutClassName).toBe("grid-cols-3 gap-gap-x-m");
    expect(state.hasMultipleTopRanks).toBe(false);
  });

  it("emphasizes every shared first place in a three-card layout", () => {
    const twoWayTie = getInterestDisplayState([
      interest("공동 1위 A", 3),
      interest("공동 1위 B", 3),
      interest("3위", 1),
    ]);
    const threeWayTie = getInterestDisplayState([
      interest("공동 1위 A", 3),
      interest("공동 1위 B", 3),
      interest("공동 1위 C", 3),
    ]);

    expect(twoWayTie.cards.map(({ isTopRank }) => isTopRank)).toEqual([
      true,
      true,
      false,
    ]);
    expect(twoWayTie.hasMultipleTopRanks).toBe(true);
    expect(threeWayTie.cards.every(({ isTopRank }) => isTopRank)).toBe(true);
    expect(threeWayTie.hasMultipleTopRanks).toBe(true);
  });

  it("uses server order for two tied interests and emphasizes both", () => {
    const state = getInterestDisplayState([
      interest("왼쪽", 2),
      interest("오른쪽", 2),
    ]);

    expect(state.cards.map(({ interest }) => interest.interestName)).toEqual([
      "왼쪽",
      "오른쪽",
    ]);
    expect(state.cards.every(({ isTopRank }) => isTopRank)).toBe(true);
    expect(state.layoutClassName).toContain("justify-evenly");
    expect(state.layoutClassName).toContain("var(--spacing-gap-x-m)");
  });

  it("emphasizes only the first of two non-tied interests", () => {
    const state = getInterestDisplayState([
      interest("왼쪽", 2),
      interest("오른쪽", 1),
    ]);

    expect(state.cards.map(({ isTopRank }) => isTopRank)).toEqual([true, false]);
    expect(state.hasMultipleTopRanks).toBe(false);
    expect(state.layoutClassName).toContain("justify-evenly");
  });

  it("returns one emphasized card when only one ranked interest has answers", () => {
    const state = getInterestDisplayState([
      interest("유일한 주제", 2),
      interest("0회", 0),
      interest("횟수 없음"),
    ]);

    expect(state.cards).toHaveLength(1);
    expect(state.cards[0]).toMatchObject({ rank: 1, isTopRank: true });
    expect(state.layoutClassName).toBe("grid-cols-3 gap-gap-x-m");
  });

  it("does not backfill a zero-count top-three interest with fourth place", () => {
    const state = getInterestDisplayState([
      interest("1위", 2),
      interest("2위", 1),
      interest("0회", 0),
      interest("4위", 1),
    ]);

    expect(state.cards.map(({ interest }) => interest.interestName)).toEqual([
      "1위",
      "2위",
    ]);
  });

  it("returns no cards for empty or non-positive ranked interests", () => {
    expect(getInterestDisplayState([]).cards).toEqual([]);
    expect(
      getInterestDisplayState([
        interest("0회", 0),
        interest("횟수 없음"),
      ]).cards,
    ).toEqual([]);
  });

  it("renders the plural title for shared first place", () => {
    const markup = renderToStaticMarkup(
      <InterestSection
        report={
          {
            month: 7,
            interestStats: {
              interests: [interest("관계", 2), interest("성장", 2)],
            },
          } as MonthlyReportV2
        }
      />,
    );

    expect(markup).toContain("7월에는 이런 주제들에 대해 많이 답했어요.");
    expect(markup).toContain("justify-evenly");
    expect(markup).toContain("var(--spacing-gap-x-m)");
    expect(markup).not.toContain("scale-80");
  });

  it("renders one answered interest centered with the singular title", () => {
    const markup = renderToStaticMarkup(
      <InterestSection
        report={
          {
            month: 7,
            interestStats: {
              interests: [interest("관계", 2), interest("휴식", 0)],
            },
          } as MonthlyReportV2
        }
      />,
    );

    expect(markup).toContain("7월에는 관계 질문에 가장 많이 답했어요.");
    expect(markup).toContain("col-start-2");
    expect(markup).not.toContain("0회 작성");
  });

  it("keeps a two-digit answer count badge on one line", () => {
    const markup = renderToStaticMarkup(
      <InterestSection
        report={
          {
            month: 7,
            interestStats: {
              interests: [interest("관계", 20)],
            },
          } as MonthlyReportV2
        }
      />,
    );

    expect(markup).toContain("20회 작성");
    expect(markup).toContain("whitespace-nowrap");
  });
});
