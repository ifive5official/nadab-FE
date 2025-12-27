import BlockButton from "@/components/BlockButton";
import { SubHeader } from "@/components/Headers";
import { ChatVerificationReceptionIcon } from "@/components/Icons";
import { currentUserOptions } from "@/features/user/quries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

// Todo: 라우팅 구조 변경
export const Route = createFileRoute("/_authenticated/today/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  return (
    <>
      <SubHeader>오늘의 질문</SubHeader>
      <main className="relative flex flex-col -mt-header-height -mb-padding-y-m h-svh -mx-padding-x-m">
        <div className="absolute inset-0 bg-[url(/background.png)] bg-cover dark:filter dark:invert dark:hue-rotate-180 dark:saturate-120 dark:brightness-95" />
        <div className="relative mt-header-height flex-1 flex flex-col gap-margin-y-xxl justify-center items-center">
          <div className="text-center">
            <p className="text-label-l text-text-secondary">
              {currentUser.nickname}님,
            </p>
            <p className="text-title-1 break-keep">
              인생의 마지막 날, 되돌아본다면 나에게 어떤 말을 할까요?
            </p>
          </div>
          <div className="flex flex-col gap-gap-y-xl">
            <SpeechBalloon>
              미래에 지금의 나를 되돌아본다면 해주고 싶은 말이 분명 있을거에요.
            </SpeechBalloon>
            <SpeechBalloon>
              지나온 시간에서 가장 가치 있는 것을 골라보세요.
            </SpeechBalloon>
            <SpeechBalloon>
              그 대답 속에 담긴 내 진짜 마음은 무엇인가요?
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
