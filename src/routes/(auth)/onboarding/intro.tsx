import { createFileRoute } from "@tanstack/react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import { useRef, useState } from "react";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";
// @ts-ignore
import "swiper/css/pagination";
import BlockButton from "@/components/BlockButton";
import { LeftCarousel, RightCarousel } from "@/components/Carousels";
import clsx from "clsx";
import { useNavigate, useBlocker } from "@tanstack/react-router";
import { getNextStepPath } from "@/features/auth/signupSteps";
import useOnboardingStore from "@/store/onboardingStore";

export const Route = createFileRoute("/(auth)/onboarding/intro")({
  component: FeatureDescription,
});

function FeatureDescription() {
  useBlocker({
    shouldBlockFn: ({ action }) => {
      return action === "BACK";
    },
  });

  // Todo: 시간 날 때 이미지 처리하지 말고 직접 만들자....
  const contents = [
    {
      category: "오늘의 질문",
      title: `하루 한 번,
당신에게 질문을 보내요.`,
      content: `무엇을 써야 할지 막막했나요? 
매일의 질문에 따라, 
당신의 생각과 감정을 글쓰기로 기록해보세요. 
꾸준한 기록은 당신의 마음을 단단하게 만들 거예요.`,
      imgSrc: "/onboarding1.png",
    },
    {
      category: "리포트",
      title: `흩어진 기록 속에서
'나'를 발견해요.`,
      content: `당신의 소중한 이야기들이 쌓이면, 연결고리를 찾아낼 거예요. 
잊고 있던 당신의 생각 패턴이나, 
어느새 훌쩍 자란 당신의 모습을 발견하는 여정에 함께할게요.
ㅤ`,
      imgSrc: "/onboarding2.png",
    },
    {
      category: "친구",
      title: `친구들과 
나의 생각을 나눠요.`,
      content: `당신이 신뢰하는 소수의 친구들과 당신의 생각 조각을
잠시 나눌 수 있는 작은 공간을 마련했어요.
공유하고 싶은 기록이 생겼다면, 공유하기로 함께 나눠보세요.
ㅤ`,
      imgSrc: "/onboarding3.png",
    },
    {
      category: "크리스탈",
      title: `답을 통해 크리스탈을 쌓고
크리스탈로 리포트를 받아요.`,
      content: `매일 도착하는 질문에 답변을 남기면 10개의 크리스탈을 받아요.
차곡차곡 쌓은 크리스탈을 사용해 주간, 월간, 전체 리포트를 받아볼 수 있어요. 리포트를 통해 당신의 기록 속에 담긴 내면의 깊은 모습을 발견해보세요.`,
      imgSrc: "/onboarding4.png",
    },
  ];
  const swiperRef = useRef<SwiperType>(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const paginationRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const updateHasSeenIntro = useOnboardingStore.use.updateHasSeenIntro();
  const navigate = useNavigate();

  return (
    <div className="-mt-header-height h-[calc(100svh-var(--spacing-padding-y-m))] flex flex-col gap-padding-y-xl pt-padding-y-m">
      <div className="flex-1 w-full relative">
        {/* 커스텀 네비게이션 */}
        <LeftCarousel
          ref={prevRef}
          className={clsx(
            "absolute top-1/2 z-10 left-0 sm:block hidden",
            activeIndex === 0 && "hidden!"
          )}
        />
        <RightCarousel
          ref={nextRef}
          className={clsx(
            "absolute top-1/2 z-10 right-0 sm:block hidden",
            activeIndex === contents.length - 1 && "hidden!"
          )}
        />
        <Swiper
          spaceBetween={10}
          modules={[Navigation, Pagination]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            // 순서 이슈로 ref가 주입이 안 되어서 임시 땜빵
            setTimeout(() => {
              // @ts-ignore
              swiper.params.navigation.prevEl = prevRef.current;
              // @ts-ignore
              swiper.params.navigation.nextEl = nextRef.current;
              // @ts-ignore
              swiper.params.pagination.el = paginationRef.current;

              swiper.navigation.init();
              swiper.navigation.update();
              swiper.pagination.init();
              swiper.pagination.render();
              swiper.pagination.update();
            });
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          navigation={{ enabled: false }}
          pagination={{ enabled: false }}
          className="h-full"
        >
          {Array(contents.length)
            .fill(0)
            .map((_, i) => {
              return (
                // 스와이프에 불편해서 드래그 막음
                <SwiperSlide
                  key={i}
                  style={{
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                    userSelect: "none",
                  }}
                >
                  <div className="h-full flex flex-col gap-padding-y-xl">
                    <div className="flex-1 bg-[#bbc5cc] rounded-[20px] relative overflow-hidden">
                      <img
                        src={contents[i].imgSrc}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="w-fit text-caption-s text-brand-primary py-padding-y-xxs px-padding-x-xs border border-brand-primary rounded-3xl">
                        {contents[i].category}
                      </div>
                      <h1 className="whitespace-pre-line text-headline-s text-text-primary mt-gap-y-s mb-gap-y-l">
                        {contents[i].title}
                      </h1>
                      <p className="text-text-tertiary text-caption-l whitespace-pre-line">
                        {contents[i].content}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
        </Swiper>
      </div>

      <div ref={paginationRef}></div>

      <BlockButton
        disabled={activeIndex !== contents.length - 1}
        onClick={() => {
          updateHasSeenIntro();
          const nextStep = getNextStepPath("intro");
          navigate({ to: nextStep });
        }}
      >
        시작하기
      </BlockButton>
    </div>
  );
}
