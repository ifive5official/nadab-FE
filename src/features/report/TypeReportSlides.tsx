import { Swiper, SwiperSlide } from "swiper/react";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";
// @ts-ignore
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { useEffect, useRef, useState } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { crystalsOptions, currentUserOptions } from "../user/quries";
import useModalStore from "@/store/modalStore";
import type { components } from "@/generated/api-types";
import { hasLastConsonant } from "@/lib/hasLastConsonant";
import { InfoButton } from "./ReportComponents";
import { Popover } from "@/components/Popover";
import { Badge } from "@/components/Badges";
import { findEmotionByCode } from "@/constants/emotions";
import { motion, animate, useMotionValue, useTransform } from "motion/react";

type Props = {
  typeName: string;
  typeReport: components["schemas"]["TypeReportResponse"];
  isPopoverOpen: boolean;
  handlePopoverOpen: () => void;
  handlePooverClose: () => void;
};

export default function TypeReportSlides({
  typeName,
  typeReport,
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
                className="w-[180px] aspect-square mx-auto"
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
              <TypeReportDesctiptionSection
                content={typeReport.typeAnalysis!}
              ></TypeReportDesctiptionSection>
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
              <div className="flex-1 flex gap-gap-x-s mb-gap-y-l">
                {typeReport.emotionStats?.emotions?.map((emotion) => {
                  return (
                    <div
                      key={emotion.emotionName}
                      className="h-full flex-1 flex flex-col items-center justify-end gap-gap-y-xs"
                    >
                      <span className="text-label-s">
                        <AnimatedNumber
                          value={emotion.percent!}
                          isActive={true}
                        />
                        %
                      </span>
                      <div
                        style={{
                          backgroundColor: findEmotionByCode(
                            emotion.emotionCode!,
                          )?.color,
                          height: `${(emotion.percent! / (typeReport.emotionStats?.emotions?.[0].percent ?? 100)) * 80}%`,
                        }}
                        className="rounded-t-lg w-full"
                      />

                      <span className="text-label-s text-text-secondary">
                        {emotion.emotionName}
                      </span>
                    </div>
                  );
                })}
              </div>
              <TypeReportDesctiptionSection
                content={`긍정 감정이 전체의 81%를 차지했어요. 새로운 걸 발견할 때 에너지를 얻는 탐색형 성향이 나타나고 있어요.`}
              ></TypeReportDesctiptionSection>
            </TypeReportSlide>
          </SwiperSlide>
          {/* <div className="w-full mt-padding-y-l flex flex-col">
          <div className="relative mb-margin-y-l">
            <div className="flex items-end">
              <p className="text-title-3 mr-auto">
                {currentUser.nickname}님은
                <br />
                <span className="text-brand-primary">
                  {typeReport.current.analysisTypeName}
                </span>
                {hasLastConsonant(typeReport.current.analysisTypeName!)
                  ? "이에요."
                  : "예요."}
              </p>
              <InfoButton onClick={() => setIsPopoverOpen(true)} />
            </div>
            {isPopoverOpen && (
              <div className="absolute z-1 top-full w-full mt-margin-y-m flex justify-center">
                <Popover
                  isOpen={isPopoverOpen}
                  onClose={() => setIsPopoverOpen(false)}
                  className="dark:bg-surface-layer-2"
                />
              </div>
            )}
          </div>
          <img
            src={typeReport.current.typeImageUrl}
            className="mx-margin-x-l aspect-square"
          />
          <div className="flex gap-gap-x-s my-gap-y-l">
            <Badge size="m">{typeReport.current.hashTag1!}</Badge>
            <Badge size="m">{typeReport.current.hashTag2!}</Badge>
            <Badge size="m">{typeReport.current.hashTag3!}</Badge>
          </div>
          <p className="text-body-2 text-text-secondary allow-copy">
            {typeReport.current.typeAnalysis}
          </p>
          <div className="my-gap-y-xl flex flex-col gap-gap-y-l allow-copy">
            <div className="rounded-2xl px-padding-x-m py-padding-y-m bg-field-bg-hover border border-border-base flex flex-col gap-padding-y-xs">
              <p className="text-interactive-text-default text-label-l">
                {typeReport.current.personaTitle1}
              </p>
              <p className="text-text-secondary text-body-2">
                {typeReport.current.personaContent1}
              </p>
            </div>
            <div className="rounded-2xl px-padding-x-m py-padding-y-m bg-field-bg-hover border border-border-base flex flex-col gap-padding-y-xs">
              <p className="text-interactive-text-default text-label-l">
                {typeReport.current.personaTitle2}
              </p>
              <p className="text-text-secondary text-body-2">
                {typeReport.current.personaContent2}
              </p>
            </div>
          </div>
          <BlockButton
            isLoading={isLoading}
            variant={crystalBalance >= 100 ? "primary" : "disabled"}
            onClick={() => {
              if (crystalBalance >= 100) {
                generateTypeReportMutation.mutate();
              } else {
                showModal({
                  icon: WarningFilledIcon,
                  title: "현재 보유한\n크리스탈이 부족해요.",
                  children: (
                    <p className="flex items-center gap-gap-x-s">
                      <span className="text-caption-m">남은 크리스탈 개수</span>
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
        </div> */}
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
  highlight: string;
  suffix: string;
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
  content: string;
};

function TypeReportDesctiptionSection({
  content,
}: TypeReportDescriptionSectionProps) {
  return (
    <div className="bg-surface-base text-body-2 px-padding-x-s py-padding-y-s rounded-xl border border-border-base">
      {content}
    </div>
  );
}

function AnimatedNumber({
  value,
  isActive,
}: {
  value: number;
  isActive: boolean;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (isActive) {
      const controls = animate(count, value, {
        duration: 0.5,
        ease: [0.25, 1, 0.5, 1],
      });
      return controls.stop;
    }
  }, [isActive, value, count]);

  return <motion.span>{rounded}</motion.span>;
}
