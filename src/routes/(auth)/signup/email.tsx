import { createFileRoute, redirect } from "@tanstack/react-router";
import BlockButton from "@/components/BlockButton";
import { useInputValidation } from "@/hooks/useInputValidation";
import InputField from "@/components/InputFields";
import { useNavigate } from "@tanstack/react-router";
import StepTitle from "@/features/auth/StepTitle";
import { getNextStepPath } from "@/features/auth/signupSteps";
import useSignupStore from "@/store/signupStore";
import { useSendEmailCodeMutation } from "@/features/auth/hooks/useSendEmailCodeMutation";

export const Route = createFileRoute("/(auth)/signup/email")({
  component: Email,
  beforeLoad: () => {
    // 이전 단계 건너뛰는 것 방지
    const { isRequiredTermsAgreed } = useSignupStore.getState();
    if (!isRequiredTermsAgreed) {
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
    setError: setEmailError,
  } = useInputValidation("email");
  const navigate = useNavigate();

  const emailMutation = useSendEmailCodeMutation({
    onSuccess: (email: string) => {
      updateEmail(email);
      const nextStep = getNextStepPath("email");
      navigate({ to: nextStep });
    },
    onEmailInvalid: (message: string) => setEmailError(message),
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
            emailMutation.mutate({ email, verificationType: "SIGNUP" });
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
