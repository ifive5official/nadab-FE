import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import BlockButton from "@/components/BlockButton";
import useSignupStore from "@/store/signupStore";
import InputField from "@/components/InputFields";
import StepTitle from "@/features/auth/StepTitle";
import { getNextStepPath } from "@/features/auth/signupSteps";
import {
  useInputValidation,
  useConfirmPasswordValidation,
} from "@/hooks/useInputValidation";

export const Route = createFileRoute("/(auth)/signup/password")({
  component: Password,
  beforeLoad: () => {
    // 이전 단계 건너뛰는 것 방지
    const { isEmailVerified } = useSignupStore.getState();
    if (!isEmailVerified) {
      throw redirect({ to: "/signup/terms" });
    }
  },
});

export default function Password() {
  const updatePassword = useSignupStore.use.updatePassword();
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
      <div className="py-padding-y-m">
        <StepTitle>비밀번호를 설정해주세요.</StepTitle>
      </div>

      <form
        className="flex flex-col gap-gap-y-l py-padding-y-m"
        onSubmit={(e) => {
          e.preventDefault();
          if (!passwordError && !confirmPasswordError) {
            updatePassword(password);
            const nextStep = getNextStepPath("password");
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
