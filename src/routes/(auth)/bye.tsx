import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import StepTitle from "@/features/auth/StepTitle";
import { createFileRoute, useBlocker } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/bye")({
  component: RouteComponent,
});

function RouteComponent() {
  useBlocker({
    shouldBlockFn: ({ action }) => {
      return action === "BACK";
    },
  });

  return (
    <>
      <SubHeader
        showBackButton={false}
        showMenuButton={false}
        showCloseButton={true}
      >
        탈퇴완료
      </SubHeader>
      <Container className="gap-gap-y-l py-padding-y-m">
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
      </Container>
    </>
  );
}
