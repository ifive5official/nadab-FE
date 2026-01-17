import { MainHeader } from "@/components/Headers";
import { useSuspenseQuery } from "@tanstack/react-query";
import { currentUserOptions } from "../user/quries";
import Tabs from "@/components/Tabs";
import BlockButton from "@/components/BlockButton";
import Container from "@/components/Container";
import { Link } from "@tanstack/react-router";
import FriendSection from "./FriendSection";
import RecordSection from "./RecordSection";
import { questionOptions } from "../question/queries";
import { useRerollQuestionMutation } from "../question/useRerollQuestionMutation";
import { formatISODate } from "@/lib/formatDate";
import { homeOptions } from "./queries";

export default function Home() {
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  const friends = Array(0).fill(0); // Todo: 백엔드 연동
  const { data: question } = useSuspenseQuery(questionOptions);
  const { data: homeData } = useSuspenseQuery(homeOptions);
  const rerollQuestionMutation = useRerollQuestionMutation();

  return (
    <>
      <MainHeader profileImgUrl={currentUser.profileImageUrl} />
      <Tabs />
      <Container
        className="relative bg-[#E8ECFC] dark:bg-field-bg-hover"
        hasHeader={false}
      >
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
                className="absolute inset-0 w-full h-full rounded-full object-cover opacity-65 dark:opacity-100"
                muted
                autoPlay
                loop
                playsInline
                poster="/marble.webp"
              >
                <source src="/marble.mp4" type="video/mp4" />
              </video>

              <div className="absolute inset-0 flex flex-col justify-center items-center gap-gap-y-xl">
                <p className="text-body-1 text-center dark:text-neutral-900">
                  <span className="text-headline-l text-brand-primary">
                    {homeData.totalRecordDays}
                  </span>
                  일째
                  <br />
                  기록을 남겼어요.
                </p>
                {friends.length > 0 && <FriendSection friends={friends} />}
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col gap-padding-y-xxl">
          <RecordSection data={homeData} />
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
