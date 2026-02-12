import BlockButton from "@/components/BlockButton";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { currentUserOptions } from "@/features/user/quries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import SpeechBalloon from "@/components/Speechballoon";
import { ChatVerificationReceptionIcon } from "@/components/Icons";
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
  // 배경색이 하단바에 비치게 함
  useEffect(() => {
    document.documentElement.classList.add("no-safe-padding");
    return () => document.documentElement.classList.remove("no-safe-padding");
  }, []);

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
      <main className="relative flex flex-col h-full bg-surface-base dark:bg-neutral-1100 pb-(--safe-bottom)">
        <div className="absolute inset-0 bg-[url(/background.png)] bg-cover opacity-60 dark:opacity-70" />
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
                    {/* 크아악~!! */}
                    {/* Todo: 컴포넌트로 추출.... */}
                    {/* Todo: 그림자 좀 어떻게 해보자 */}
                    <div className="relative text-caption-l w-fit rounded-xl shadow-button-1 after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none after:shadow-[inset_-4px_-4px_10px_0px_rgba(7,8,117,0.6)] after:mix-blend-overlay active:after:shadow-none text-text-primary dark:text-neutral-1000 bg-surface-base dark:bg-neutral-200">
                      <ChatVerificationReceptionIcon className="absolute top-0 -left-0.5 text-surface-base dark:text-neutral-100" />
                      <div className="w-fit max-w-[clamp(calc(272px*0.5),calc((272/390)*100vw),calc(272px*1.2))] px-padding-x-m py-padding-y-xs break-keep">
                        {message}
                      </div>
                    </div>
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
