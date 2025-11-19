import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { InputFieldWithButton } from "@/components/InputFields";
import { useInputValidation } from "@/hooks/useInputValidation";
import BlockButton from "@/components/BlockButton";
import useResetPasswordStore from "@/store/resetPasswordStore";
import { getNextStepPath } from "@/features/auth/resetPasswordStep";

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
  return (
    <form
      className="py-padding-x-m flex flex-col gap-margin-y-m"
      onSubmit={(e) => {
        e.preventDefault();
        updateEmail(email);
        const nextStep = getNextStepPath("forgot");
        navigate({ to: nextStep });
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
        onChange={(e) => onEmailChange(e.target.value)}
        buttonLabel="인증"
        buttonDisabled={!email || !!emailError}
        // Todo: 인증번호 전송 백엔드 연동
        onButtonClick={() => {}}
      />
      <BlockButton disabled={!email || !!emailError}>다음</BlockButton>
    </form>
  );
}
