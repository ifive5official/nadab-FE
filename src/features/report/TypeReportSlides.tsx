import { Swiper, SwiperSlide } from "swiper/react";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";
// @ts-ignore
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { useRef } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { crystalsOptions, currentUserOptions } from "../user/quries";
import useModalStore from "@/store/modalStore";
import type { components } from "@/generated/api-types";
import { hasLastConsonant } from "@/lib/hasLastConsonant";
import { InfoButton, StyledSegments } from "./ReportComponents";
import { Popover } from "@/components/Popover";
import { Badge, CrystalBadge } from "@/components/Badges";
import { findEmotionByCode } from "@/constants/emotions";
import Chart from "./Chart";
import BlockButton from "@/components/BlockButton";
import { WarningFilledIcon } from "@/components/Icons";
import clsx from "clsx";

type Props = {
  typeName: string;
  typeReport: components["schemas"]["TypeReportResponse"];
  isLoading: boolean;
  onGenerate: () => void;
  isPopoverOpen: boolean;
  handlePopoverOpen: () => void;
  handlePooverClose: () => void;
};

export default function TypeReportSlides({
  typeName,
  typeReport,
  isLoading,
  onGenerate,
  isPopoverOpen,
  handlePopoverOpen,
  handlePooverClose,
}: Props) {
  const { data: crystalData } = useQuery(crystalsOptions);
  const crystalBalance = crystalData?.crystalBalance ?? 0;
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);

  const { showModal, closeModal } = useModalStore();

  const paginationRef = useRef(null);

  return (
    <>
      <div className="w-full flex-1 mb-gap-y-xl mt-margin-y-l rounded-2xl shadow-1">
        <Swiper
          resistance={true}
          resistanceRatio={0}
          className="h-full"
          modules={[Pagination]}
          pagination={{ enabled: false }}
          spaceBetween={8}
          onSwiper={(swiper) => {
            // 순서 이슈로 ref가 주입이 안 되어서 임시 땜빵
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
            <TypeReportSlide>
              <TypeReportTitleSection
                prefix={`${currentUser.nickname}님은`}
                highlight={typeReport.analysisTypeName!}
                suffix={
                  hasLastConsonant(typeReport.analysisTypeName!)
                    ? "이에요."
                    : "예요."
                }
                isPopoverOpen={isPopoverOpen}
                handlePopoverOpen={handlePopoverOpen}
                handlePopoverClose={handlePooverClose}
              />
              <img
                src={typeReport.typeImageUrl}
                className="w-[180px] aspect-square my-auto mx-auto"
              />
              <div className="flex gap-gap-x-s mt-gap-y-s mb-gap-y-l">
                <Badge
                  size="variable"
                  className="text-button-3 px-padding-x-m py-padding-y-xxs"
                >
                  {typeReport.hashTag1!}
                </Badge>
                <Badge
                  size="variable"
                  className="text-button-3 px-padding-x-m py-padding-y-xxs"
                >
                  {typeReport.hashTag2!}
                </Badge>
                <Badge
                  size="variable"
                  className="text-button-3 px-padding-x-m py-padding-y-xxs"
                >
                  {typeReport.hashTag3!}
                </Badge>
              </div>
              <TypeReportDesctiptionSection>
                <StyledSegments
                  segments={
                    typeReport.typeAnalysisContent?.styledText?.segments ?? []
                  }
                  type="mix"
                />
              </TypeReportDesctiptionSection>
            </TypeReportSlide>
          </SwiperSlide>
          <SwiperSlide>
            <TypeReportSlide>
              <TypeReportTitleSection
                prefix={`${typeName} 카테고리에서`}
                highlight={`가장 많이 느낀 감정은 ${findEmotionByCode(typeReport.emotionStats!.dominantEmotionCode!)?.title}`}
                suffix={
                  hasLastConsonant(
                    findEmotionByCode(
                      typeReport.emotionStats!.dominantEmotionCode!,
                    )!.title,
                  )
                    ? "이에요."
                    : "예요."
                }
                isPopoverOpen={isPopoverOpen}
                handlePopoverOpen={handlePopoverOpen}
                handlePopoverClose={handlePooverClose}
              />
              <Chart typeReport={typeReport} />
              <TypeReportDesctiptionSection>
                <StyledSegments
                  segments={
                    typeReport.emotionSummaryContent?.styledText?.segments ?? []
                  }
                  type="bold"
                />
              </TypeReportDesctiptionSection>
            </TypeReportSlide>
          </SwiperSlide>
          <SwiperSlide>
            <TypeReportSlide>
              <div className="h-full flex flex-col gap-gap-y-l">
                <TypeReportTitleSection
                  prefix="이런 태도가 주로 발견됐어요."
                  isPopoverOpen={isPopoverOpen}
                  handlePopoverOpen={handlePopoverOpen}
                  handlePopoverClose={handlePooverClose}
                />
                <div className="my-auto flex flex-col gap-gap-y-l">
                  <TypeReportDesctiptionSection
                    title={typeReport.personaTitle1}
                  >
                    {typeReport.personaContent1!}
                  </TypeReportDesctiptionSection>
                  <TypeReportDesctiptionSection
                    title={typeReport.personaTitle2}
                  >
                    {typeReport.personaContent2!}
                  </TypeReportDesctiptionSection>
                </div>

                <BlockButton
                  isLoading={isLoading}
                  variant={crystalBalance >= 100 ? "primary" : "disabled"}
                  onClick={() => {
                    if (crystalBalance >= 100) {
                      onGenerate();
                    } else {
                      showModal({
                        icon: WarningFilledIcon,
                        title: "현재 보유한\n크리스탈이 부족해요.",
                        children: (
                          <p className="flex items-center gap-gap-x-s">
                            <span className="text-caption-m">
                              남은 크리스탈 개수
                            </span>
                            <CrystalBadge crystals={100 - crystalBalance} />
                          </p>
                        ),
                        buttons: [{ label: "확인", onClick: closeModal }],
                      });
                    }
                  }}
                >
                  100 크리스탈로 리포트 새로 받기
                </BlockButton>
              </div>
            </TypeReportSlide>
          </SwiperSlide>
        </Swiper>
      </div>

      <div ref={paginationRef} />
    </>
  );
}

function TypeReportSlide({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col w-full bg-surface-layer-1 rounded-2xl px-padding-x-m py-padding-y-m">
      {children}
    </div>
  );
}

type TypeReportTitleSectionProps = {
  prefix: string;
  highlight?: string;
  suffix?: string;
  isPopoverOpen: boolean;
  handlePopoverOpen: () => void;
  handlePopoverClose: () => void;
};

function TypeReportTitleSection({
  prefix,
  highlight,
  suffix,
  isPopoverOpen,
  handlePopoverOpen,
  handlePopoverClose,
}: TypeReportTitleSectionProps) {
  return (
    <div className="relative">
      <div className="flex gap-gap-x-s items-end">
        <p className="text-label-l mr-auto break-keep">
          {prefix}
          <br />
          <span className="text-brand-primary">{highlight}</span>
          {suffix}
        </p>
        <InfoButton onClick={handlePopoverOpen} />
      </div>
      {isPopoverOpen && (
        <div className="absolute z-1 top-full w-full mt-margin-y-m flex justify-center">
          <Popover
            isOpen={isPopoverOpen}
            onClose={handlePopoverClose}
            className="dark:bg-surface-layer-2"
          />
        </div>
      )}
    </div>
  );
}

type TypeReportDescriptionSectionProps = {
  title?: string;
  children: React.ReactNode;
};

function TypeReportDesctiptionSection({
  title,
  children,
}: TypeReportDescriptionSectionProps) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-padding-y-xs bg-surface-base border border-border-base",
        title
          ? "px-padding-x-m py-padding-y-m rounded-2xl"
          : "px-padding-x-s py-padding-y-s rounded-xl",
      )}
    >
      {title && <span className="text-label-l">{title}</span>}
      <p className={clsx("text-body-2", title && "text-text-secondary")}>
        {children}
      </p>
    </div>
  );
}
