import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { InputFieldWithButton } from "@/components/InputFields";
import { useInputValidation } from "@/hooks/useInputValidation";
import useResetPasswordStore from "@/store/resetPasswordStore";
import { getNextStepPath } from "@/features/auth/resetPasswordStep";
import { useSendEmailCodeMutation } from "@/features/auth/hooks/useSendEmailCodeMutation";

export const Route = createFileRoute("/(auth)/password/forgot")({
  component: Forgot,
});

function Forgot() {
  const {
    value: email,
    error: emailError,
    setError: setEmailError,
    onChange: onEmailChange,
  } = useInputValidation("email");
  const updateEmail = useResetPasswordStore.use.updateEmail();

  const navigate = useNavigate();

  const emailMutation = useSendEmailCodeMutation({
    onSuccess: () => {
      updateEmail(email);
      const nextStep = getNextStepPath("forgot");
      navigate({ to: nextStep });
    },
    onEmailInvalid: (message: string) => setEmailError(message),
  });

  return (
    <form className="py-padding-y-m flex flex-col gap-gap-y-l">
      <p className="text-caption-m text-text-secondary">
        가입한 이메일 주소를 입력해주세요.
        <br />
        비밀번호 재설정을 위한 이메일을 보내드리겠습니다.
      </p>
      <InputFieldWithButton
        label="이메일"
        type="email"
        id="email"
        placeholder="가입한 이메일 주소를 입력해주세요"
        value={email}
        error={emailError}
        isLoading={emailMutation.isPending}
        onChange={(e) => onEmailChange(e.target.value)}
        buttonLabel="인증"
        buttonDisabled={!email || !!emailError}
        onButtonClick={() =>
          emailMutation.mutate({ email, verificationType: "PASSWORD_RESET" })
        }
      />
    </form>
  );
}
