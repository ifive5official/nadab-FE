import { EmotionBadge } from "@/components/Badges";
import BlockButton from "@/components/BlockButton";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { QuestionSection } from "@/features/daily/QuestionSection";
import { currentUserOptions } from "@/features/user/quries";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useBlocker,
  notFound,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { questionOptions } from "@/features/question/queries";
import { dailyReportOptions } from "@/features/report/quries";
import emotions from "@/constants/emotions";
import ReportMessage from "@/features/report/ReportMessage";
import axios from "axios";
import ErrorPage from "@/components/ErrorPage";

export const Route = createFileRoute("/_authenticated/daily/report/$reportId")({
  component: RouteComponent,
  notFoundComponent: () => <ErrorPage error={{ message: "404 Not Found" }} />,
  loader: async ({ context: { queryClient }, params: { reportId } }) => {
    try {
      await Promise.all([
        queryClient.ensureQueryData(questionOptions),
        queryClient.ensureQueryData(dailyReportOptions(Number(reportId))),
      ]);
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
  // 뒤로가기 제한
  useBlocker({
    shouldBlockFn: ({ action }) => {
      return action === "BACK";
    },
  });

  const { reportId } = Route.useParams();

  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  const { data: question } = useSuspenseQuery(questionOptions);
  const { data: report } = useSuspenseQuery(
    dailyReportOptions(Number(reportId)),
  );
  const messages = report.content!.split(/(?<=[.!?])\s/);

  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500 * messages.length);
    return () => clearTimeout(timer);
  }, [messages.length]);

  return (
    <>
      <SubHeader showBackButton={false}>오늘의 리포트</SubHeader>
      <Container>
        <div className="flex-1 flex flex-col gap-gap-y-xl py-padding-y-m">
          <QuestionSection question={question!} />
          <div className="border-b border-interactive-border-default" />
          <div className="flex flex-col items-start">
            <EmotionBadge
              emotion={report.emotion as (typeof emotions)[number]["code"]}
            />
            <p className="text-title-2 mt-gap-y-s mb-gap-y-l">
              오늘의 기록 속 {currentUser.nickname}님은
            </p>
            <div className="flex flex-col gap-gap-y-m">
              {messages.map((message, i) => {
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.3, 1] }}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut",
                      delay: 0.001 + i * 0.5,
                    }}
                  >
                    <ReportMessage>{message}</ReportMessage>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <BlockButton disabled={!isReady} onClick={() => navigate({ to: "/" })}>
          홈으로 돌아가기
        </BlockButton>
      </Container>
    </>
  );
}
