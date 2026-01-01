import { MainHeader } from "@/components/Headers";
import { useSuspenseQuery } from "@tanstack/react-query";
import { currentUserOptions } from "../user/quries";
import Tabs from "@/components/Tabs";
import { CrystalBadge } from "@/components/Badges";
import BlockButton from "@/components/BlockButton";
import Container from "@/components/Container";
import { Link } from "@tanstack/react-router";
import FriendSection from "./FriendSection";
import RecordSection from "./RecordSection";
import { questionOptions } from "../question/queries";
import { useRerollQuestionMutation } from "../question/useRerollQuestionMutation";
import { formatISODate } from "@/lib/formatDate";

export default function Home() {
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  const friends = Array(0).fill(0); // Todo: 백엔드 연동
  const { data: question } = useSuspenseQuery(questionOptions);
  const rerollQuestionMutation = useRerollQuestionMutation();

  return (
    <>
      <MainHeader profileImgUrl={currentUser.profileImageUrl} />
      <Tabs />
      <Container className="relative" hasHeader={false}>
        {/* 배경 - 다크모드 필터 적용을 위해 따로 뺌 */}
        <div
          className="absolute inset-0 bg-linear-to-b from-[#E8ECFC] to-[#EFF6FF] 
               dark:filter dark:invert dark:hue-rotate-180 dark:saturate-120 dark:brightness-95"
        />

        <div className="flex-1 flex flex-col justify-evenly">
          {/* 질문 */}
          <p className="relative text-title-2 text-center">
            {currentUser.nickname}님,
            <br />
            {question?.questionText}
          </p>
          {/* 구슬 */}
          <div className="flex items-center justify-center">
            <div className="relative w-[min(calc((267/390)*100vw),calc((267/796)*100svh))] sm:w-[calc((267/390)*412px)] aspect-square ">
              <video
                className="absolute inset-0 w-full h-full rounded-full object-cover opacity-65 dark:filter dark:invert dark:hue-rotate-180 dark:saturate-120 dark:brightness-95"
                autoPlay
                muted
                loop
                playsInline
                poster="/marble.webp"
              >
                <source src="/marble.mp4" type="video/mp4" />
              </video>

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
        </div>

        <div className="relative flex flex-col gap-padding-y-xxl">
          {friends.length > 0 ? (
            <FriendSection friends={friends} />
          ) : (
            <RecordSection />
          )}
          {question?.answered ? (
            <Link
              to="/detail/$date"
              params={{ date: formatISODate(new Date()) }}
            >
              <BlockButton>오늘의 기록 보러가기</BlockButton>
            </Link>
          ) : (
            <div className="flex gap-margin-x-m">
              <BlockButton
                variant={question?.rerollUsed ? "disabled" : "secondary"}
                onClick={() => rerollQuestionMutation.mutate()}
                isLoading={rerollQuestionMutation.isPending}
              >
                새로운 질문 받기
              </BlockButton>
              <Link to="/today" className="w-full">
                <BlockButton>쓰러가기</BlockButton>
              </Link>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
