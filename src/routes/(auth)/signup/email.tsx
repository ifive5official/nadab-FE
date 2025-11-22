import { createFileRoute, redirect } from "@tanstack/react-router";
import BlockButton from "@/components/BlockButton";
import { useInputValidation } from "@/hooks/useInputValidation";
import InputField from "@/components/InputFields";
import { useNavigate } from "@tanstack/react-router";
import StepTitle from "@/features/auth/StepTitle";
import { getNextStepPath } from "@/features/auth/signupSteps";
import useSignupStore from "@/store/signupStore";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/(auth)/signup/email")({
  component: Email,
  beforeLoad: () => {
    // 이전 단계 건너뛰는 것 방지
    const { isTermsAgreed } = useSignupStore.getState();
    if (!isTermsAgreed) {
      throw redirect({ to: "/signup/terms" });
    }
  },
});

export default function Email() {
  const updateEmail = useSignupStore.use.updateEmail();
  const {
    value: email,
    error: emailError,
    onChange: onEmailChange,
  } = useInputValidation("email");
  const navigate = useNavigate();

  const emailMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      // Todo: 중복 확인 백엔드 api 연동
      await new Promise((resolve) => setTimeout(resolve, 300));
      alert(email + "로 인증번호 발송: 123456");
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { email };
    },
    onSuccess: () => {
      updateEmail(email);
      const nextStep = getNextStepPath("email");
      navigate({ to: nextStep });
    },
    // Todo: 에러 처리(토스트 보여줄 예정)
  });

  return (
    <div>
      <div className="py-padding-y-m">
        <StepTitle>이메일을 입력해주세요.</StepTitle>
      </div>

      <form
        className="flex flex-col gap-gap-y-s"
        onSubmit={(e) => {
          e.preventDefault();
          if (!emailError) {
            // Todo: 중복 확인 api 호출 + 로딩 상태 UI 반영
            emailMutation.mutate({ email });
          }
        }}
      >
        <InputField
          label="이메일 주소"
          id="email"
          name="email"
          onChange={(e) => onEmailChange(e.target.value)}
          value={email}
          placeholder="이메일을 입력해주세요."
          type="email"
          error={emailError}
          className="py-padding-y-m"
        />

        <BlockButton
          isLoading={emailMutation.isPending}
          disabled={!!emailError || !email}
        >
          완료
        </BlockButton>
      </form>
    </div>
  );
}
