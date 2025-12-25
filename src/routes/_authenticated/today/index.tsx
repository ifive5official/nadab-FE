import BlockButton from "@/components/BlockButton";
import { SubHeader } from "@/components/Headers";
import { ChatVerificationReceptionIcon } from "@/components/Icons";
import { createFileRoute, Link } from "@tanstack/react-router";

// Todo: 라우팅 구조 변경
export const Route = createFileRoute("/_authenticated/today/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <SubHeader>오늘의 질문</SubHeader>
      <main className="relative flex flex-col -mt-header-height -mb-padding-y-m h-svh -mx-padding-x-m">
        <div className="absolute inset-0 bg-[url(/background.png)] bg-cover dark:filter dark:invert dark:hue-rotate-180 dark:saturate-120 dark:brightness-95" />
        <div className="relative mt-header-height flex-1 flex flex-col gap-margin-y-xxl justify-center items-center">
          <div className="text-center">
            <p className="text-label-l text-text-secondary">가나다라님의</p>
            <p className="text-title-1">설렘의 순간은 언제였나요?</p>
          </div>
          <div className="flex flex-col gap-gap-y-xl">
            <SpeechBalloon>설렘이란 뭘까요?</SpeechBalloon>
            <SpeechBalloon>
              굳이 인생 최고의 순간일 필요는 없어요.
            </SpeechBalloon>
            <SpeechBalloon>
              플레이리스트에서 좋은 노래를 발견했을 때처럼 최근 설렜던 순간을
              꺼내봐요!
            </SpeechBalloon>
          </div>
        </div>
        <div className="px-padding-x-m">
          <Link to="/today/write">
            <BlockButton className="mb-padding-x-m">답변하기</BlockButton>
          </Link>
        </div>
      </main>
    </>
  );
}

function SpeechBalloon({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative text-caption-l">
      <ChatVerificationReceptionIcon className="absolute top-0 -left-0.5 text-neutral-0" />
      <div className="w-fit max-w-[clamp(calc(272px*0.5),calc((272/390)*100vw),calc(272px*1.2))] px-padding-x-m py-padding-y-xs bg-neutral-0 rounded-xl break-keep">
        {children}
      </div>
    </div>
  );
}
