import { createFileRoute, useNavigate } from "@tanstack/react-router";
import useResetPasswordStore from "@/store/resetPasswordStore";
import {
  useInputValidation,
  useConfirmPasswordValidation,
} from "@/hooks/useInputValidation";
import StepTitle from "@/features/auth/StepTitle";
import InputField from "@/components/InputFields";
import BlockButton from "@/components/BlockButton";
import { getNextStepPath } from "@/features/auth/resetPasswordStep";

export const Route = createFileRoute("/(auth)/password/reset")({
  component: Reset,
});

function Reset() {
  const updatePassword = useResetPasswordStore.use.updatePassword();
  const {
    value: password,
    error: passwordError,
    onChange: onPasswordChange,
  } = useInputValidation("password");
  const {
    value: confirmPassword,
    error: confirmPasswordError,
    onChange: onConfirmPasswordChange,
    validate: validateConfirmPassword,
  } = useConfirmPasswordValidation(password);
  const navigate = useNavigate();

  return (
    <div>
      <div className="my-margin-y-m">
        <StepTitle>비밀번호를 설정해주세요.</StepTitle>
      </div>

      <form
        className="flex flex-col gap-margin-y-m py-padding-y-m"
        onSubmit={(e) => {
          e.preventDefault();
          if (!passwordError && !confirmPasswordError) {
            updatePassword(password);
            // Todo: 백엔드 비밀번호 변경 api 연동
            const nextStep = getNextStepPath("reset");
            navigate({
              to: nextStep,
            });
          }
        }}
      >
        <InputField
          label="비밀번호"
          id="password"
          name="password"
          onChange={(e) => {
            onPasswordChange(e.target.value);
            if (confirmPassword) {
              validateConfirmPassword();
            }
          }}
          value={password}
          placeholder="비밀번호를 입력해주세요."
          type="password"
          error={passwordError}
        />
        <InputField
          label="비밀번호 재확인"
          id="confirmPassword"
          name="confirmPassword"
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          value={confirmPassword}
          placeholder="비밀번호를 입력해주세요."
          type="password"
          error={confirmPasswordError}
        />

        <p className="text-caption-m text-neutral-800">
          영문, 숫자, 특수문자가 포함된 8자 이상의 비밀번호를 입력해주세요.
        </p>
        <BlockButton
          disabled={
            !(
              !passwordError &&
              !confirmPasswordError &&
              password &&
              confirmPassword
            )
          }
        >
          완료
        </BlockButton>
      </form>
    </div>
  );
}
