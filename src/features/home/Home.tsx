import { MainHeader } from "@/components/Headers";
import { useSuspenseQueries } from "@tanstack/react-query";
import { currentUserOptions } from "../user/quries";
import Tabs from "@/components/Tabs";
import BlockButton from "@/components/BlockButton";
import Container from "@/components/Container";
import { Link, useNavigate } from "@tanstack/react-router";
import FriendSection from "./FriendSection";
import RecordSection from "./RecordSection";
import { questionOptions } from "../question/queries";
import { useRerollQuestionMutation } from "../question/useRerollQuestionMutation";
import { formatISODate } from "@/lib/formatters";
import { homeOptions } from "./queries";
import { useEffect } from "react";
import useModalStore from "@/store/modalStore";

export default function Home() {
  // 배경색이 하단바에 비치게 함
  useEffect(() => {
    document.documentElement.classList.add("no-safe-padding");
    return () => document.documentElement.classList.remove("no-safe-padding");
  }, []);

  const navigate = useNavigate();
  const { showModal, closeModal } = useModalStore();

  const [{ data: currentUser }, { data: question }, { data: homeData }] =
    useSuspenseQueries({
      queries: [currentUserOptions, questionOptions, homeOptions],
    });
  const rerollQuestionMutation = useRerollQuestionMutation();

  useEffect(() => {
    if (!question) {
      // 이미 해당 카테고리의 모든 질문에 답한 경우
      showModal({
        icon: () => (
          <img
            src="/mainLogo.png"
            alt="모달 아이콘"
            className="aspect-square h-[33px] p-[11px] box-content"
          />
        ),
        title: "잠깐, 다른 주제를 골라볼까요?",
        children: "선택한 주제의 질문에 모두 답했어요.",
        buttons: [
          {
            label: "주제 고르기",
            onClick: () => {
              closeModal();
              navigate({ to: "/account" });
            },
          },
        ],
      });
    }
  }, [question, showModal, closeModal, navigate]);

  return (
    <>
      <MainHeader profileImgUrl={currentUser.profileImageUrl} />
      <Tabs />
      <Container className="relative bg-[#E8ECFC] dark:bg-field-bg-hover pb-[calc(var(--spacing-padding-y-m)+var(--safe-bottom))]!">
        <div className="flex-1 flex flex-col justify-evenly">
          {/* 질문 */}
          <p className="relative text-title-2 text-center">
            {question && (
              <>
                {currentUser.nickname}님,
                <br />
                {question?.questionText}
              </>
            )}
          </p>
          {/* 구슬 */}
          <div className="flex items-center justify-center">
            <div className="relative w-[min(calc((267/390)*100vw),calc((267/796)*100svh))] sm:w-[calc((267/390)*412px)] aspect-square ">
              <img
                src="/video.webp"
                className="absolute inset-0 w-full h-full rounded-full object-cover opacity-65 dark:opacity-100"
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center gap-gap-y-xl">
                <p className="text-body-1 text-center dark:text-neutral-900">
                  <span className="text-headline-l text-brand-primary">
                    {homeData.totalRecordDays}
                  </span>
                  일째
                  <br />
                  기록을 남겼어요.
                </p>
                {homeData.answeredFriendCount! > 0 && (
                  <FriendSection
                    friends={homeData.answeredFriendProfiles!}
                    friendsCnt={homeData.answeredFriendCount!}
                  />
                )}
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
              <Link to="/daily" className="w-full">
                <BlockButton>쓰러가기</BlockButton>
              </Link>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
