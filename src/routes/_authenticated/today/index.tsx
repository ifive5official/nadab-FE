import BlockButton from "@/components/BlockButton";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { currentUserOptions } from "@/features/user/quries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import SpeechBalloon from "@/components/Speechballoon";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { questionOptions } from "@/features/question/queries";

export const Route = createFileRoute("/_authenticated/today/")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(questionOptions);
  },
});

function RouteComponent() {
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  const { data: question } = useSuspenseQuery(questionOptions);
  const messages = [
    question?.empathyGuide,
    question?.hintGuide,
    question?.leadingQuestionGuide,
  ];

  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500 * messages.length);
    return () => clearTimeout(timer);
  }, [messages.length]);

  return (
    <>
      <SubHeader>오늘의 질문</SubHeader>
      <main className="relative flex flex-col h-full">
        <div className="absolute inset-0 bg-[url(/background.png)] bg-cover dark:filter dark:invert dark:hue-rotate-180 dark:saturate-120 dark:brightness-95" />
        <Container>
          <div className="relative flex-1 flex flex-col gap-margin-y-xxl justify-center items-center">
            <div className="text-center">
              <p className="text-label-l text-text-secondary">
                {currentUser.nickname}님,
              </p>
              <p className="text-title-1 break-keep">
                {question?.questionText}
              </p>
            </div>
            <div className="flex flex-col gap-gap-y-xl">
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
                    <SpeechBalloon
                      textColor="var(--color-text-primary)"
                      bgColor="var(--color-surface-base)"
                    >
                      {message}
                    </SpeechBalloon>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <BlockButton
            disabled={!isReady}
            onClick={() => navigate({ to: "/today/write" })}
          >
            답변하기
          </BlockButton>
        </Container>
      </main>
    </>
  );
}
