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
import { QuestionBadge } from "@/components/Badges";
import categories from "@/constants/categories";
import useBottomModalStore from "@/store/bottomModalStore";
import { useUpdateInterestMutation } from "../user/hooks/useUpdateInterestMutation";
import { MoreHorizontalIcon } from "@/components/Icons";
import useCoachMarkTourStore from "@/store/coachMarkTourStore";
import { HOME_COACH_MARK_STEP_IDS } from "./homeCoachMarkSteps";
import clsx from "clsx";
import { useHomeEntryPrompts } from "./useHomeEntryPrompts";
import UpdateNoticeModal from "./UpdateNoticeModal";

export default function Home() {
  const navigate = useNavigate();
  const { showModal, closeModal, showError } = useModalStore();
  const { showBottomModal, closeBottomModal } = useBottomModalStore();
  const {
    goToStep: goToCoachMarkStep,
    next: nextCoachMarkStep,
    currentStepId: coachMarkStepId,
  } = useCoachMarkTourStore();

  // 앱 상에서 배경색이 하단바에 비치게 함
  useEffect(() => {
    document.documentElement.classList.add("no-safe-padding");
    return () => document.documentElement.classList.remove("no-safe-padding");
  }, []);

  const [{ data: currentUser }, { data: question }, { data: homeData }] =
    useSuspenseQueries({
      queries: [currentUserOptions, questionOptions, homeOptions],
    });
  const rerollQuestionMutation = useRerollQuestionMutation();
  const canRerollQuestion = (question?.rerollRemainingCount ?? 0) > 0;
  const { updateNoticeModal } = useHomeEntryPrompts({
    question,
    latestVersion: homeData.latestVersion,
  });

  // 이미 해당 카테고리의 모든 질문에 답한 경우 처리
  useEffect(() => {
    if (!question) {
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

  const interestCode =
    question?.interestCode as (typeof categories)[number]["code"];

  const updateInterestMutation = useUpdateInterestMutation({
    onSuccess: () => {
      // 홈에서 관심 주제 변경 시 질문 새로고침
      rerollQuestionMutation.mutate();
    },
  });

  return (
    <>
      <MainHeader profileImgUrl={currentUser.profileImageUrl} />
      <UpdateNoticeModal {...updateNoticeModal} />
      <Tabs />
      <Container className="relative bg-[#E8ECFC] dark:bg-field-bg-hover pb-[calc(var(--spacing-padding-y-m)+var(--safe-bottom))]!">
        <div className="flex-1 flex flex-col justify-evenly">
          {/* 질문 */}
          <div className="flex flex-col items-center gap-gap-y-m">
            <QuestionBadge
              data-coachmark="home-question-badge"
              className="cursor-pointer"
              rightElement={
                !question?.answered && <MoreHorizontalIcon size={16} />
              }
              onClick={
                question?.answered
                  ? undefined
                  : () => {
                      showBottomModal({
                        title: "선택 주제 변경",
                        items: categories.map((category) => {
                          const isSelected = category.code === interestCode;
                          return {
                            label: category.title,
                            type: isSelected ? "selected" : "unselected",
                            onClick: async () => {
                              if (!isSelected) {
                                closeBottomModal();
                                if (
                                  useCoachMarkTourStore.getState()
                                    .currentStepId ===
                                  HOME_COACH_MARK_STEP_IDS.step4SelectQuestionTopic
                                ) {
                                  window.setTimeout(() => {
                                    nextCoachMarkStep();
                                  }, 0);
                                }
                                if (canRerollQuestion) {
                                  showModal({
                                    icon: () => (
                                      <img
                                        src="/mainLogo.png"
                                        alt="모달 아이콘"
                                        className="aspect-square h-[33px] p-[11px] box-content"
                                      />
                                    ),
                                    title: "선택 주제를 변경할까요?",
                                    children:
                                      "확인 시 새로운 선택 주제와 함께 다른 질문으로 변경돼요.",
                                    buttons: [
                                      {
                                        label: "취소",
                                        onClick: closeModal,
                                      },
                                      {
                                        label: "확인",
                                        onClick: () => {
                                          updateInterestMutation.mutate({
                                            interestCode: category.code,
                                          });
                                          closeModal();
                                        },
                                      },
                                    ],
                                  });
                                } else {
                                  showError("새로고침 횟수가 부족해요.");
                                }
                              }
                            },
                          };
                        }),
                      });
                      if (
                        coachMarkStepId ===
                        HOME_COACH_MARK_STEP_IDS.step3QuestionTopicBadge
                      ) {
                        window.setTimeout(() => {
                          goToCoachMarkStep(
                            HOME_COACH_MARK_STEP_IDS.step4SelectQuestionTopic,
                          );
                        }, 0);
                      }
                    }
              }
              category={interestCode}
            />
            <p
              className="relative text-title-2 text-center"
              data-coachmark="home-question-text"
            >
              {question && (
                <>
                  {currentUser.nickname}님,
                  <br />
                  {question?.questionText}
                </>
              )}
            </p>
          </div>

          {/* 구슬 */}
          <div className="flex items-center justify-center">
            <div className="relative w-[min(calc((267/390)*100vw),calc((267/796)*100*var(--dvh)))] sm:w-[calc((267/390)*412px)] aspect-square ">
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

        <div className="relative flex flex-col gap-padding-y-xl">
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
                data-coachmark="home-reroll-question-button"
                variant={canRerollQuestion ? "secondary" : "disabled"}
                onClick={() => rerollQuestionMutation.mutate()}
                isLoading={rerollQuestionMutation.isPending}
              >
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                  <span
                    className={clsx(
                      "text-button-1",
                      canRerollQuestion
                        ? "text-button-secondary-text-default"
                        : "text-button-disabled-text",
                    )}
                  >
                    새로운 질문 받기
                  </span>
                  {canRerollQuestion && (
                    <span className="text-caption-s text-neutral-1000">
                      남은 새로고침 {question?.rerollRemainingCount}번
                    </span>
                  )}
                </div>
              </BlockButton>
              <Link to="/daily" className="w-full">
                <BlockButton data-coachmark="home-write-button">
                  쓰러가기
                </BlockButton>
              </Link>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
