import BlockButton from "@/components/BlockButton";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { currentUserOptions } from "@/features/user/quries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import SpeechBalloon from "@/components/Speechballoon";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/today/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  const messages = [
    "미래에 지금의 나를 되돌아본다면 해주고 싶은 말이 분명 있을거에요.",
    "지나온 시간에서 가장 가치 있는 것을 골라보세요.",
    "그 대답 속에 담긴 내 진짜 마음은 무엇인가요?",
  ];

  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500 * messages.length);
    return () => clearTimeout(timer);
  }, []);

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
                인생의 마지막 날, 되돌아본다면 나에게 어떤 말을 할까요?
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
