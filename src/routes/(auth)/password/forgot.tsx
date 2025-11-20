import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { InputFieldWithButton } from "@/components/InputFields";
import { useInputValidation } from "@/hooks/useInputValidation";
import useResetPasswordStore from "@/store/resetPasswordStore";
import { getNextStepPath } from "@/features/auth/resetPasswordStep";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/(auth)/password/forgot")({
  component: Forgot,
});

function Forgot() {
  const {
    value: email,
    error: emailError,
    onChange: onEmailChange,
  } = useInputValidation("email");
  const updateEmail = useResetPasswordStore.use.updateEmail();

  const navigate = useNavigate();

  const emailMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      // Todo: 가입 여부 확인 백엔드 api 연동
      await new Promise((resolve) => setTimeout(resolve, 300));
      alert(email + "로 인증번호 발송: 123456");
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { email };
    },
    onSuccess: () => {
      updateEmail(email);
      const nextStep = getNextStepPath("forgot");
      navigate({ to: nextStep });
    },
    // Todo: 에러 처리(토스트 보여줄 예정)
  });

  return (
    <form
      className="py-padding-x-m flex flex-col gap-margin-y-m"
      onSubmit={(e) => {
        e.preventDefault();
        emailMutation.mutate({ email });
      }}
    >
      <p className="text-caption-m text-neutral-800">
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
        onButtonClick={() => emailMutation.mutate({ email })}
      />
    </form>
  );
}
