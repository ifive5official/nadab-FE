import { StyledSegments } from "@/features/report/ReportComponents";
import {
  IconLabel,
  ReportSectionHeader,
  SurfaceCard,
} from "./LayoutPrimitives";
import type { MonthlyReportV2 } from "./types";
import { normalizeSegments } from "./utils";

export function HeroSection({ report }: { report: MonthlyReportV2 }) {
  return (
    <section className="flex flex-col gap-y-gap-y-m">
      <ReportSectionHeader
        caption={`${report.month}월 리포트 요약`}
        title={`"${report.summary}"`}
      />
      {report.imageUrl && (
        <figure className="text-center">
          <img
            src={report.imageUrl}
            alt={`${report.month ?? ""}월 월간 리포트 이미지`}
            className="w-full object-cover"
          />
          <figcaption className="text-caption-m text-text-tertiary">
            *AI가 즉석 생성한 이미지로, 불완전할 수 있어요.
          </figcaption>
        </figure>
      )}
    </section>
  );
}

export function DiscoverySection({ report }: { report: MonthlyReportV2 }) {
  return (
    <section className="flex flex-col gap-gap-y-l">
      <IconLabel
        iconSrc="/icon/magnifying-glass.png"
        alt="돋보기 아이콘"
        label="이런 면도 발견되었어요"
      />
      <SurfaceCard className="text-body-2 allow-copy">
        <StyledSegments
          segments={normalizeSegments(report.discovered?.segments)}
          type="mix"
        />
      </SurfaceCard>
    </section>
  );
}
