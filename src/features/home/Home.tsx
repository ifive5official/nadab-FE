import { MainHeader } from "@/components/Headers";
import { useSuspenseQuery } from "@tanstack/react-query";
import { currentUserOptions } from "../user/quries";
import Tabs from "@/components/Tabs";
// import QuestionSection from "./QuestionSection";
// import RecordSection from "./RecordSection";
import { CrystalBadge } from "@/components/Badges";
import { motion } from "motion/react";
import BlockButton from "@/components/BlockButton";
import ProfileImg from "@/components/ProfileImg";

export default function Home() {
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  const friends = Array(7).fill(0); // 임시
  const MAX_VISIBLE = 5;
  // const hasFriends = friends.length > 0;
  const visibleFriends =
    friends.length <= MAX_VISIBLE ? friends : friends.slice(0, MAX_VISIBLE - 1);
  return (
    <div className="w-full h-full flex flex-col">
      <MainHeader profileImgUrl={currentUser.profileImageUrl} />
      <Tabs />
      <main className="flex-1 relative w-full overflow-hidden bg-linear-to-b from-[#E8ECFC] to-[#EFF6FF] flex flex-col">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-57"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <p className="text-title-2 text-center">
            {currentUser.nickname}님,
            <br />
            설렘의 순간은 언제였나요?
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-center shrink-0">
          <div className="relative w-[calc((306/390)*100vw)] h-[calc((306/390)*100vw)] sm:w-[306px] sm:h-[306px]">
            <svg
              className="w-full h-full"
              viewBox="0 0 314 314"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M211.966 14.4403C230.684 21.6618 247.796 32.4993 262.326 46.3342C276.855 60.169 288.518 76.7302 296.647 95.0722C304.776 113.414 309.213 133.178 309.704 153.234C310.195 173.291 306.731 193.248 299.51 211.966C292.288 230.684 281.451 247.796 267.616 262.326C253.781 276.855 237.22 288.518 218.878 296.647C200.536 304.776 180.773 309.213 160.716 309.704C140.659 310.196 120.702 306.732 101.984 299.51C83.2662 292.289 66.1539 281.451 51.6243 267.616C37.0947 253.781 25.4324 237.22 17.3032 218.878C9.17396 200.536 4.73706 180.773 4.24581 160.716C3.75456 140.659 7.21858 120.702 14.4401 101.984C21.6616 83.2664 32.4992 66.1541 46.334 51.6245C60.1689 37.0949 76.73 25.4326 95.072 17.3034C113.414 9.17416 133.178 4.73727 153.234 4.24602C173.291 3.75477 193.248 7.21879 211.966 14.4403L211.966 14.4403Z"
                stroke="white"
                strokeWidth="8.4"
              />

              <motion.path
                d="M164.884 4.40506C205.348 6.50261 243.321 24.5886 270.451 54.6842C297.58 84.7798 311.643 124.42 309.545 164.884C307.448 205.348 289.362 243.322 259.266 270.451C229.17 297.58 189.53 311.643 149.066 309.545C108.602 307.448 70.6285 289.362 43.4993 259.266C16.37 229.171 2.30731 189.531 4.40485 149.066C6.50239 108.602 24.5883 70.6287 54.684 43.4995C84.7796 16.3702 124.42 2.30752 164.884 4.40506L164.884 4.40506Z"
                stroke="url(#paint0_linear_16686_12870)"
                strokeWidth="8.4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 0.7 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />

              <defs>
                <linearGradient
                  id="paint0_linear_16686_12870"
                  x1="164.198"
                  y1="-0.0269713"
                  x2="281.698"
                  y2="69.973"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#B5E7FF" />

                  <stop offset="1" stopColor="#5D57F6" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col justify-center items-center gap-gap-y-xl">
              <p className="text-body-1 text-center">
                <span className="text-headline-l text-brand-primary">49</span>
                일째
                <br />
                기록을 남겼어요.
              </p>
              <div className="flex flex-col items-center gap-gap-y-xs">
                <p className="text-caption-m">다음 보상까지 31일</p>
                <CrystalBadge height={25} crystals={30} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 relative flex flex-col">
          <div className="flex-1 flex flex-col justify-center items-center gap-gap-y-s">
            <p className="text-caption-l text-text-secondary">
              이 질문에 답변한 친구들
            </p>
            <div className="flex">
              {visibleFriends.map((_friend, i) => (
                <ProfileImg
                  key={i}
                  width={36}
                  src={undefined}
                  className="-mr-2.5"
                />
              ))}
              {friends.length > MAX_VISIBLE && (
                <div className="w-9 aspect-square rounded-full flex justify-center items-center text-label-s bg-button-primary-bg-default border border-interactive-border-default text-text-inverse-primary">
                  +{friends.length - 4}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-margin-x-m px-padding-x-m pb-padding-y-m">
            <BlockButton variant="secondary">새로운 질문 받기</BlockButton>
            <BlockButton>쓰러가기</BlockButton>
          </div>
        </div>
      </main>
    </div>
  );
}
