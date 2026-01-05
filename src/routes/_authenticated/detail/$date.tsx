import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { createFileRoute } from "@tanstack/react-router";
import { QuestionBadge, EmotionBadge } from "@/components/Badges";
import { questionOptions } from "@/features/question/queries";
import { reportOptions } from "@/features/report/quries";
import { useSuspenseQueries } from "@tanstack/react-query";
import categories from "@/constants/categories";
import emotions from "@/constants/emotions";
import { formatKoreanDate } from "@/lib/formatDate";
import { currentUserOptions } from "@/features/user/quries";
import { AccordionIcon } from "@/components/Icons";
import { useState } from "react";
import ReportMessage from "@/features/report/ReportMessage";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/_authenticated/detail/$date")({
  component: RouteComponent,
  //   Todo: 검색 api 나오면 특정 날짜 질문 답변 조회하도록 변경
  //   Todo: 작성하지 않은 날짜의 경우 404 페이지로 보냄
  //   Todo: 에러 처리
  loader: ({ context: { queryClient } }) => {
    return Promise.all([
      queryClient.ensureQueryData(questionOptions),
      queryClient.ensureQueryData(reportOptions),
    ]);
  },
});

function RouteComponent() {
  const [{ data: currentUser }, { data: question }, { data: report }] =
    useSuspenseQueries({
      queries: [currentUserOptions, questionOptions, reportOptions],
    });
  const ReportMessages = report.content!.split(/(?<=[.!?])\s/);
  const [isReportOpen, setIsReportOpen] = useState(false);

  return (
    <>
      <SubHeader>상세 보기</SubHeader>
      <Container>
        <div className="px-padding-x-m py-padding-y-m mt-padding-y-m bg-surface-layer-1 border border-border-base shadow-2 rounded-2xl">
          <div className="flex gap-padding-x-xxs">
            <QuestionBadge
              category={
                question.interestCode as (typeof categories)[number]["code"]
              }
            />
            <EmotionBadge
              emotion={report.emotion as (typeof emotions)[number]["code"]}
            />
            <span className="text-caption-s text-text-secondary ml-auto">
              {formatKoreanDate(new Date())}
            </span>
          </div>
          <h2 className="text-title-2 mt-margin-y-s mb-margin-y-l break-keep">
            {question.questionText}
          </h2>
          <section className="bg-interactive-bg-default border border-border-base px-padding-x-m py-padding-y-m rounded-2xl flex flex-col gap-padding-y-xs">
            <h3 className="text-title-3">나의 답변</h3>
            <p className="text-body-2 text-text-tertiary">{report.answer}</p>
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
