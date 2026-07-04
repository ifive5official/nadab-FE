import {
  FullBleedReportBanner,
  IconLabel,
  ReportSectionHeader,
  SurfaceCard,
} from "./LayoutPrimitives";
import type { InterestStat, MonthlyReportV2 } from "./types";
import { getCommentCardWidth, splitSegmentsIntoSentences } from "./utils";

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
  const interests = report.interestStats?.interests ?? [];
  if (interests.length === 0) {
    return null;
  }

  const mostAnsweredInterest = interests[0];
  const rankedInterests = [interests[1], interests[0], interests[2]].filter(
    (interest): interest is InterestStat => Boolean(interest),
  );

  return (
    <section className="flex flex-col gap-gap-y-s">
      <IconLabel
        iconSrc="/icon/magnifying-glass.png"
        alt="돋보기 아이콘"
        label="많이 답한 선택 주제"
      />
      <h1 className="text-label-l">
        {report.month}월에는 {mostAnsweredInterest.interestName} 질문에 가장
        많이 답했어요.
      </h1>
      <div className="grid grid-cols-3 items-center gap-gap-x-m mt-margin-y-m">
        {rankedInterests.map((interest) => {
          const rank = interests.indexOf(interest) + 1;
          const isTopRank = rank === 1;
          const originClassName = rank === 2 ? "origin-right" : "origin-left";

          return (
            <SurfaceCard
              key={interest.interestCode ?? interest.interestName ?? rank}
              roundedClassName="rounded-lg"
              className={`flex aspect-square w-full flex-col items-center justify-center gap-gap-y-s text-center ${
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
              <span className="rounded-full border border-brand-primary px-padding-x-s py-padding-y-xxs text-caption-s text-brand-primary">
                {interest.count ?? 0}회 작성
              </span>
            </SurfaceCard>
          );
        })}
      </div>
    </section>
  );
}
