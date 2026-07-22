import {
  FullBleedReportBanner,
  IconLabel,
  ReportSectionHeader,
  SurfaceCard,
} from "./LayoutPrimitives";
import type { InterestStat, MonthlyReportV2 } from "./types";
import { getCommentCardWidth, splitSegmentsIntoSentences } from "./utils";

export type InterestCard = {
  interest: InterestStat;
  rank: number;
  isTopRank: boolean;
};

export type InterestDisplayState = {
  cards: InterestCard[];
  hasMultipleTopRanks: boolean;
  layoutClassName: string;
};

// 상위 선택 주제의 노출 여부와 순서, 공동 1위 강조 상태를 계산합니다.
export function getInterestDisplayState(
  interests: InterestStat[] | undefined,
): InterestDisplayState {
  const rankedInterests = (interests ?? [])
    .slice(0, 3)
    .map((interest, index) => ({ interest, rank: index + 1 }))
    .filter(({ interest }) => (interest.count ?? 0) > 0);
  const topCount = rankedInterests[0]?.interest.count;
  const cards = rankedInterests.map(({ interest, rank }) => ({
    interest,
    rank,
    isTopRank: interest.count === topCount,
  }));
  const hasMultipleTopRanks =
    cards.filter(({ isTopRank }) => isTopRank).length > 1;

  return {
    cards: cards.length === 3 ? [cards[1], cards[0], cards[2]] : cards,
    hasMultipleTopRanks,
    layoutClassName:
      cards.length === 2
        ? "grid-cols-[repeat(2,calc((100%_-_var(--spacing-gap-x-m)_*_2)_/_3))] justify-evenly"
        : "grid-cols-3 gap-gap-x-m",
  };
}

export function CommentSection({ report }: { report: MonthlyReportV2 }) {
  const sentences = splitSegmentsIntoSentences(report.comment?.segments);

  return (
    <FullBleedReportBanner
      className="-mt-padding-y-m pb-padding-y-xl pt-padding-y-s"
      contentClassName="flex flex-col gap-gap-y-xl"
    >
      <ReportSectionHeader caption="나답의 한 마디" title={report.commentSummary} />
      <div className="flex flex-col gap-y-gap-y-l">
        {sentences.map((sentence, index) => {
          const widthClassName = getCommentCardWidth(sentence, index);

          return (
            <div
              key={`${sentence}-${index}`}
              className={`self-center ${widthClassName} rounded-xl bg-surface-base px-padding-x-m py-padding-y-s text-center shadow-2`}
            >
              <p className="text-body-2 break-keep allow-copy">{sentence}</p>
            </div>
          );
        })}
      </div>
    </FullBleedReportBanner>
  );
}

export function InterestSection({ report }: { report: MonthlyReportV2 }) {
  const { cards, hasMultipleTopRanks, layoutClassName } =
    getInterestDisplayState(report.interestStats?.interests);
  if (cards.length === 0) {
    return null;
  }

  const mostAnsweredInterest = cards.find(({ rank }) => rank === 1)?.interest;

  return (
    <section className="flex flex-col gap-gap-y-s">
      <IconLabel
        iconSrc="/icon/magnifying-glass.png"
        alt="돋보기 아이콘"
        label="많이 답한 선택 주제"
      />
      <h1 className="text-label-l">
        {hasMultipleTopRanks
          ? `${report.month}월에는 이런 주제들에 대해 많이 답했어요.`
          : `${report.month}월에는 ${mostAnsweredInterest?.interestName ?? ""} 질문에 가장 많이 답했어요.`}
      </h1>
      <div
        className={`grid ${layoutClassName} items-center mt-margin-y-m`}
      >
        {cards.map(({ interest, rank, isTopRank }) => {
          const originClassName = rank === 2 ? "origin-right" : "origin-left";
          const centeredClassName = cards.length === 1 ? "col-start-2" : "";

          return (
            <SurfaceCard
              key={interest.interestCode ?? interest.interestName ?? rank}
              roundedClassName="rounded-lg"
              className={`flex aspect-square w-full flex-col items-center justify-center gap-gap-y-s text-center ${centeredClassName} ${
                isTopRank ? "" : `scale-80 ${originClassName}`
              }`}
            >
              <span
                className={`break-keep text-text-primary ${
                  isTopRank ? "text-headline-m" : "text-title-2"
                }`}
              >
                {interest.interestName}
              </span>
              <span className="whitespace-nowrap rounded-full border border-brand-primary px-padding-x-s py-padding-y-xxs text-caption-s text-brand-primary">
                {interest.count ?? 0}회 작성
              </span>
            </SurfaceCard>
          );
        })}
      </div>
    </section>
  );
}
