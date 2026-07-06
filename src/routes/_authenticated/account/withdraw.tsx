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
import type { components } from "@/generated/api-types";

type WithdrawalReason =
  components["schemas"]["WithdrawalRequestV2"]["reasons"][number];

type WithdrawStep = "reason" | "confirm";

type ReasonOption = {
  id: WithdrawalReason;
  label: string;
};

const reasonOptions: ReasonOption[] = [
  {
    id: "DAILY_LOGGING_BURDEN",
    label: "매일 기록하고 질문에 답하는 것이 부담스러워졌어요.",
  },
  {
    id: "INSUFFICIENT_QUESTION_ANALYSIS",
    label: "나에게 맞는 질문이나 분석이 부족하다고 느꼈어요.",
  },
  {
    id: "LOSS_OF_INTEREST_IN_WRITING",
    label: "글을 쓰는 과정에서 흥미를 잃었어요.",
  },
  {
    id: "PRIVACY_RECORD_CONCERN",
    label: "감정과 기록을 남겨두는 것이 조심스러워요.",
  },
  {
    id: "APP_ERROR_OR_SLOWNESS",
    label: "앱 사용 중에 오류가 있거나 속도가 느렸어요.",
  },
  { id: "OTHER", label: "기타 (직접 입력)" },
];

export const Route = createFileRoute("/_authenticated/account/withdraw")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  const [step, setStep] = useState<WithdrawStep>("reason");
  const [selectedReasons, setSelectedReasons] = useState<WithdrawalReason[]>(
    [],
  );
  const [customReason, setCustomReason] = useState("");
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const withDrawMutation = useWithDrawMutation();
  const isOtherSelected = selectedReasons.includes("OTHER");
  const canMoveToConfirm =
    selectedReasons.length > 0 &&
    (!isOtherSelected || customReason.trim().length > 0);

  const toggleReason = (reason: WithdrawalReason) => {
    setSelectedReasons((prev) => {
      if (prev.includes(reason)) {
        return prev.filter((item) => item !== reason);
      }

      return [...prev, reason];
    });
  };

  const handleSubmit = () => {
    withDrawMutation.mutate({
      reasons: selectedReasons,
      ...(isOtherSelected ? { customReason: customReason.trim() } : {}),
    });
  };

  return (
    <>
      <SubHeader
        showMenuButton={false}
        onBackClick={step === "confirm" ? () => setStep("reason") : undefined}
      >
        회원탈퇴
      </SubHeader>
      <Container>
        <form
          className="flex-1 flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (step === "reason") {
              if (!canMoveToConfirm) return;
              setStep("confirm");
              return;
            }

            if (!hasConfirmed) return;
            handleSubmit();
          }}
        >
          {step === "reason" ? (
            <>
              <div className="flex-1 py-padding-y-m flex flex-col gap-gap-y-xl">
                <div className="flex flex-col gap-gap-y-s">
                  <StepTitle>
                    나답을 떠나는
                    <br />
                    이유를 알려주세요.
                  </StepTitle>
                  <p className="text-body-2 text-text-secondary">
                    더 나은 나답이 될 수 있도록, 떠나는 이유를 들려주세요.
                  </p>
                </div>
                <div className="flex flex-col gap-gap-y-l">
                  {reasonOptions.map((reason) => (
                    <CheckBox
                      key={reason.id}
                      checked={selectedReasons.includes(reason.id)}
                      textSize="text-button-1"
                      onCheck={() => toggleReason(reason.id)}
                      label={reason.label}
                    />
                  ))}
                  {isOtherSelected && (
                    <div className="flex flex-col">
                      <textarea
                        maxLength={200}
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="탈퇴 사유를 입력해주세요."
                        className="h-[180px] w-full px-padding-x-xs py-padding-y-xs text-caption-m rounded-lg border border-border-base placeholder:text-text-disabled resize-none focus:outline-none"
                      />
                      <div className="ml-auto text-caption-s mt-margin-y-xs">
                        <span>{customReason.length}</span>
                        <span className="text-text-disabled">/200자</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <BlockButton disabled={!canMoveToConfirm}>
                탈퇴 진행하기
              </BlockButton>
            </>
          ) : (
            <>
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
            </>
          )}
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
