import BlockButton from "@/components/BlockButton";
import CheckBox from "@/components/Checkbox";
import { SubHeader } from "@/components/Headers";
import StepTitle from "@/features/auth/StepTitle";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { currentUserOptions } from "@/features/user/quries";
import { useWithDrawMutation } from "@/features/auth/hooks/useWithDrawMutation";
import Container from "@/components/Container";

export const Route = createFileRoute("/_authenticated/account/withdraw")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const withDrawMutation = useWithDrawMutation();
  return (
    <>
      <SubHeader showMenuButton={false}>회원탈퇴</SubHeader>
      <Container>
        <form
          className="flex-1 flex flex-col"
          onSubmit={() => {
            withDrawMutation.mutate();
          }}
        >
          <div className="flex-1 py-padding-y-m flex flex-col gap-gap-y-xl">
            <StepTitle>
              {currentUser.nickname}님,
              <br />
              탈퇴 전에 확인해주세요.
            </StepTitle>
            <div className="flex flex-col gap-gap-y-l">
              <Item
                title="기록이 사라져요."
                content="이곳에 남겼던 소중한 이야기들은 14일 뒤에는 완전히 사라져, 다시는 꺼내볼 수 없어요."
              />
              <Item
                title="크리스탈이 사라져요."
                content={`그동안 모아왔던 크리스탈들은 14일 뒤 사라져
다시 사용할 수 없어요.`}
              />
            </div>
            <CheckBox
              checked={hasConfirmed}
              onCheck={() => setHasConfirmed((prev) => !prev)}
              label="모두 확인했어요."
            />
          </div>
          <BlockButton
            isLoading={withDrawMutation.isPending}
            disabled={!hasConfirmed}
          >
            탈퇴하기
          </BlockButton>
        </form>
      </Container>
    </>
  );
}

type Props = {
  title: string;
  content: string;
};

function Item({ title, content }: Props) {
  return (
    <div className="px-padding-x-m py-padding-y-m bg-surface-layer-1 rounded-lg">
      <p className="text-label-l">{title}</p>
      <p className="text-caption-m text-text-secondary break-keep whitespace-pre-line">
        {content}
      </p>
    </div>
  );
}
