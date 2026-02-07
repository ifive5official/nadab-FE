import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { QuestionBadge, EmotionBadge } from "@/components/Badges";
import { answerOptions } from "@/features/report/quries";
import { useSuspenseQueries } from "@tanstack/react-query";
import categories from "@/constants/categories";
import emotions from "@/constants/emotions";
import { currentUserOptions } from "@/features/user/quries";
import { AccordionIcon } from "@/components/Icons";
import { useState } from "react";
import ReportMessage from "@/features/report/ReportMessage";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import ShareBanner from "@/components/ShareBanner";
import {
  feedShareStatusOptions,
  friendsOptions,
} from "@/features/social/queries";
import ErrorPage from "@/components/ErrorPage";

export const Route = createFileRoute("/_authenticated/detail/$date")({
  component: RouteComponent,
  notFoundComponent: () => <ErrorPage error={{ message: "404 Not Found" }} />,
  //   Todo: 에러 처리 보완
  loader: async ({ params: { date }, context: { queryClient } }) => {
    const isToday = new Date().toLocaleDateString("en-CA") === date;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const promises: Promise<any>[] = [
      queryClient.ensureQueryData(answerOptions.detail(date)),
    ];
    if (isToday) {
      promises.push(queryClient.ensureQueryData(friendsOptions));
      promises.push(queryClient.ensureQueryData(feedShareStatusOptions));
    }
    try {
      await Promise.all(promises);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400 || status === 404) {
          /* eslint-disable @typescript-eslint/no-explicit-any */
          throw notFound() as any;
        }
      }
      throw err;
    }
  },
});

function RouteComponent() {
  const { date } = Route.useParams();
  const today = new Date().toLocaleDateString("en-CA");
  const [{ data: currentUser }, { data }, { data: friends }] =
    useSuspenseQueries({
      queries: [currentUserOptions, answerOptions.detail(date), friendsOptions],
    });
  const ReportMessages = data.content!.split(/(?<=[.!?])\s/);
  const [isReportOpen, setIsReportOpen] = useState(false);

  return (
    <>
      <SubHeader>상세 보기</SubHeader>
      <Container>
        {/* 오늘 날짜이고, 친구가 있다면 공유 배너 보임 */}
        {date === today && (friends.totalCount ?? 0) > 0 && (
          <ShareBanner className="mt-margin-y-l" />
        )}
        <div className="px-padding-x-m py-padding-y-m mt-padding-y-m bg-surface-layer-1 dark:bg-surface-layer-2 border border-border-base shadow-2 rounded-2xl">
          <div className="flex gap-padding-x-xxs">
            <QuestionBadge
              category={
                data.interestCode as (typeof categories)[number]["code"]
              }
            />
            <EmotionBadge
              emotion={data.emotion as (typeof emotions)[number]["code"]}
            />
            <span className="text-caption-s text-text-secondary ml-auto">
              {date}
            </span>
          </div>
          <h2 className="text-title-2 mt-margin-y-s mb-margin-y-l break-keep">
            {data.questionText}
          </h2>
          <section className="bg-interactive-bg-default border border-border-base px-padding-x-m py-padding-y-m rounded-2xl flex flex-col gap-padding-y-xs">
            <h3 className="text-title-3">나의 답변</h3>
            <p className="text-body-2 text-text-tertiary">{data.answer}</p>
          </section>
          <section className="bg-interactive-bg-default border border-border-base px-padding-x-m py-padding-y-m rounded-2xl flex flex-col gap-gap-y-l mt-margin-y-s">
            <div className="flex gap-margin-x-s">
              <h3 className="text-title-3 mr-auto">
                이때의 {currentUser.nickname}님은
              </h3>
              <button onClick={() => setIsReportOpen((prev) => !prev)}>
                <motion.div
                  animate={{ rotate: isReportOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AccordionIcon />
                </motion.div>
              </button>
            </div>
            <AnimatePresence>
              {isReportOpen && (
                <motion.div
                  className="flex flex-col gap-gap-y-m"
                  key="content"
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  //   transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  {ReportMessages.map((message) => {
                    return (
                      <ReportMessage key={message}>{message}</ReportMessage>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </Container>
    </>
  );
}
