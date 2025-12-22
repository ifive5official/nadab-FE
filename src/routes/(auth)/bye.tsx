import { SubHeader } from "@/components/Headers";
import StepTitle from "@/features/auth/StepTitle";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/bye")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <SubHeader showBackButton={false} showMenuButton={false}>
        탈퇴완료
      </SubHeader>
      <div className="flex flex-col gap-gap-y-l py-padding-y-m">
        <StepTitle>
          그동안 나답과 함께해주셔서
          <br />
          감사했어요.
        </StepTitle>
        <p className="text-body-1">
          기록은 앞으로 14일간 이곳에 잠시 보관돼요.
          <br /> 그 시간 안에 다시 돌아오시면,
          <br />
          다시 기록을 이어갈 수 있어요.
        </p>
      </div>
    </div>
  );
}
