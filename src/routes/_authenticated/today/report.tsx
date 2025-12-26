import { EmotionBadge } from "@/components/Badges";
import BlockButton from "@/components/BlockButton";
import { SubHeader } from "@/components/Headers";
import { QuestionSection } from "@/features/today/QuestionSection";
import { createFileRoute, Link, useBlocker } from "@tanstack/react-router";

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

  return (
    <>
      <SubHeader showBackButton={false}>오늘의 분석</SubHeader>
      <main className="flex flex-col h-full">
        <div className="flex-1 flex flex-col gap-gap-y-xl py-padding-y-m">
          <QuestionSection />
          <div className="border-b border-interactive-border-default" />
          <div>
            <EmotionBadge emotion="기쁨" />
            <p className="text-title-2 mt-gap-y-s mb-margin-y-l">
              오늘의 기록 속 가나다라님은
            </p>
            {/* eslint-disable react/no-unescaped-entities */}
            <div>
              오늘의 이야기는 그 영광이 단순히 '결과'가 아니라, 수많은 고민과
              노력을 거쳐 '나는 해낼 수 있다'는 믿음을 스스로 증명해낸 '과정' 그
              자체였음을 보여줘요. 당신 안에 잠재된 힘을 다시 한번 발견한 소중한
              기록입니다. 이 기록은 미래의 당신과 연결될 첫 번째 조각이 될
              거예요.오늘의 이야기는 그 영광이 단순히 '결과'가 아니라,
            </div>
          </div>
        </div>
        <Link to="/">
          <BlockButton>홈으로 돌아가기</BlockButton>
        </Link>
      </main>
    </>
  );
}
