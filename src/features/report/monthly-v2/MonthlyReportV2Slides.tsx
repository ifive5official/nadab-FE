import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import type { ReactNode } from "react";
import { CommentSection, InterestSection } from "./CommentInterestSections";
import { EmotionSection } from "./EmotionSection";
import { DiscoverySection, HeroSection } from "./HeroDiscoverySections";
import { SocialSection } from "./SocialSection";
import type { MonthlyReportV2 } from "./types";

export function MonthlyReportV2Slides({ report }: { report: MonthlyReportV2 }) {
  const paginationRef = useRef(null);

  return (
    <>
      <div className="-mx-padding-x-m min-h-0 w-[calc(100%_+_var(--spacing-padding-x-m)_+_var(--spacing-padding-x-m))] flex-1">
        <Swiper
          resistance={true}
          resistanceRatio={0}
          className="h-full"
          modules={[Pagination]}
          pagination={{ enabled: false }}
          spaceBetween={8}
          onSwiper={(swiper) => {
            // TypeReportSlides와 동일하게 ref 주입 순서를 맞춥니다.
            setTimeout(() => {
              // @ts-ignore
              swiper.params.pagination.el = paginationRef.current;

              swiper.pagination.init();
              swiper.pagination.render();
              swiper.pagination.update();
            });
          }}
        >
          <SwiperSlide>
            <MonthlyReportV2Slide>
              <HeroSection report={report} />
              <DiscoverySection report={report} />
            </MonthlyReportV2Slide>
          </SwiperSlide>
          <SwiperSlide>
            <MonthlyReportV2Slide>
              <EmotionSection report={report} />
            </MonthlyReportV2Slide>
          </SwiperSlide>
          <SwiperSlide>
            <MonthlyReportV2Slide>
              <CommentSection report={report} />
              <InterestSection report={report} />
            </MonthlyReportV2Slide>
          </SwiperSlide>
          {report.socialSummary?.visible === true && (
            <SwiperSlide>
              <MonthlyReportV2Slide>
                <SocialSection report={report} />
              </MonthlyReportV2Slide>
            </SwiperSlide>
          )}
        </Swiper>
      </div>
      <div ref={paginationRef} className="shrink-0 my-margin-y-l" />
    </>
  );
}

function MonthlyReportV2Slide({ children }: { children: ReactNode }) {
  return (
    <div className="h-full w-full overflow-hidden">
      <div className="h-full overflow-y-auto px-padding-x-m py-padding-y-m [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-h-full flex-col gap-padding-y-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
