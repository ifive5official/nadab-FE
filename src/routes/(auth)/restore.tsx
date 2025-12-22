import BlockButton from "@/components/BlockButton";
import { SubHeader } from "@/components/Headers";
import { useRestoreMutation } from "@/features/auth/hooks/useRestoreMutation";
import StepTitle from "@/features/auth/StepTitle";
import useRestoreStore from "@/store/restoreStore";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/restore")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const email = useRestoreStore.use.email();
  const deletionDate = useRestoreStore.use.deletionDate();
  const nickname = useRestoreStore.use.nickname();
  const password = useRestoreStore.use.password();
  const reset = useRestoreStore.use.reset();

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // 메모리에 저장하니까 새로고침 시에는 그냥 보내버림...
  // Todo: 더 좋은 방법이 없을까
  if (!nickname) {
    navigate({ to: "/login" });
  }

  const [, month, day] = deletionDate.split("-").map(Number);
  const restoreMutation = useRestoreMutation();

  return (
    <div className="h-full flex flex-col">
      <SubHeader showMenuButton={false}>계정 복구</SubHeader>
      {/* Todo: 나중에 간격 디자인토큰으로 고치자... */}
      <div className="flex-1 py-padding-y-m flex flex-col gap-9">
        <StepTitle>
          {nickname}님,
          <br /> 다시 만나서 반가워요.
          <br />
          멈췄던 기록을 이어갈까요?
        </StepTitle>
        {/* eslint-disable react/no-unescaped-entities */}
        <p>
          현재 탈퇴 절차가 진행 중이며, {month}월 {day}일에 모든 기록이 삭제될
          예정이에요. 지금 '이어가기'를 누르면 탈퇴가 취소되고 이전 기록을 모두
          확인할 수 있어요.
        </p>
      </div>
      <div className="flex gap-gap-x-m">
        <BlockButton variant="secondary" onClick={() => navigate({ to: "/" })}>
          다른 계정으로 시작하기
        </BlockButton>
        <BlockButton
          isLoading={restoreMutation.isPending}
          onClick={() => {
            restoreMutation.mutate({
              email,
              password,
            });
          }}
        >
          이어가기
        </BlockButton>
      </div>
    </div>
  );
}
