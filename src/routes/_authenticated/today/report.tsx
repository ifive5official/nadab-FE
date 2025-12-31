import { EmotionBadge } from "@/components/Badges";
import BlockButton from "@/components/BlockButton";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { QuestionSection } from "@/features/today/QuestionSection";
import { currentUserOptions } from "@/features/user/quries";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useBlocker,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";

export const Route = createFileRoute("/_authenticated/today/report")({
  component: RouteComponent,
});

function RouteComponent() {
  // 뒤로가기 제한
  useBlocker({
    shouldBlockFn: ({ action }) => {
      return action === "BACK";
    },
  });

  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  const messages = [
    "우리는 변화를 원하지만 정작 실천에 옮기는 것에는 서툴어요.",
    "거창한 계획보다는 지금 당장 할 수 있는 작은 일부터 찾아보는 것이 중요해요.",
    " 작은 성공의 경험이 쌓여야 결국 큰 목표를 이룰 수 있는 힘이 생기기 때문이에요.",
    "오늘부터 나만의 작은 루틴을 만들어 하나씩 실천해 보는 것은 어떨까요?",
  ];

  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500 * messages.length);
    return () => clearTimeout(timer);
  }, [messages.length]);

  return (
    <>
      <SubHeader showBackButton={false}>오늘의 분석</SubHeader>
      <Container>
        <div className="flex-1 flex flex-col gap-gap-y-xl py-padding-y-m">
          <QuestionSection />
          <div className="border-b border-interactive-border-default" />
          <div>
            <EmotionBadge emotion="기쁨" />
            <p className="text-title-2 mt-gap-y-s mb-gap-y-l">
              오늘의 기록 속 {currentUser.nickname}님은
            </p>
            <div className="flex flex-col gap-gap-y-m">
              {messages.map((message, i) => {
                return (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.3, 1] }}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut",
                      delay: 0.001 + i * 0.5,
                    }}
                    className="w-fit px-padding-x-s py-padding-y-m font-medium text-[13px]/[160%] text-text-secondary bg-surface-layer-1 rounded-2xl"
                  >
                    {message}
                  </motion.p>
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
