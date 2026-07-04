import ProfileImg from "@/components/ProfileImg";
import {
  FullBleedReportBanner,
  IconLabel,
  SurfaceCard,
} from "./LayoutPrimitives";
import type { MonthlyReportV2, RankingItem } from "./types";

export function SocialSection({ report }: { report: MonthlyReportV2 }) {
  const social = report.socialSummary;
  const month = social?.month ?? report.month;

  return (
    <section className="flex flex-col gap-gap-y-l">
      <FullBleedReportBanner
        className="-mt-padding-y-m min-h-36 pb-padding-y-xxl pt-padding-y-m"
        contentClassName="flex flex-col gap-gap-y-xs"
      >
        <div className="flex items-center gap-gap-x-xs">
          <span className="text-caption-m text-text-secondary">
            {month}월 동안 받은 마음
          </span>
        </div>
        <h1 className="text-title-3 break-keep text-text-primary">
          가장 많이
          <br />
          마음을 나눈 친구들
        </h1>
      </FullBleedReportBanner>
      <div className="flex flex-col gap-padding-y-l">
        <RankingList
          title="가장 많은 좋아요를 눌렀어요."
          iconSrc="/icon/heart.png"
          items={social?.likeRanking ?? []}
        />
        <RankingList
          title="가장 많은 댓글을 남겼어요."
          iconSrc="/icon/social.png"
          items={social?.commentRanking ?? []}
        />
      </div>
    </section>
  );
}

function RankingList({
  title,
  iconSrc,
  items,
}: {
  title: string;
  iconSrc: string;
  items: RankingItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <SurfaceCard className="flex flex-col gap-gap-y-s">
      <IconLabel
        iconSrc={iconSrc}
        label={title}
        iconClassName="aspect-square w-5"
        labelClassName="text-label-m text-text-secondary"
        className="gap-gap-x-xs"
      />
      <div className="flex flex-col gap-gap-y-m">
        {items.map((item, index) => (
          <SurfaceCard
            key={`${item.userId ?? "friend"}-${index}`}
            surface="base"
            paddingClassName="px-padding-x-s py-padding-y-s"
            className="flex items-center gap-gap-x-s"
          >
            <span className="w-5 text-button-1 text-brand-primary">
              {item.displayOrder}
            </span>
            <ProfileImg width={32} src={item.profileImageUrl} />
            <span className="text-button-3 text-text-primary">
              {item.nickname}
            </span>
          </SurfaceCard>
        ))}
      </div>
    </SurfaceCard>
  );
}
