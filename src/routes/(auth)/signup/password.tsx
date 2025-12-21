import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import BlockButton from "@/components/BlockButton";
import useSignupStore from "@/store/signupStore";
import { PasswordInputField } from "@/components/InputFields";
import StepTitle from "@/features/auth/StepTitle";
import { getNextStepPath } from "@/features/auth/signupSteps";
import {
  useInputValidation,
  useConfirmPasswordValidation,
} from "@/hooks/useInputValidation";
import { useSignupMutation } from "@/features/auth/hooks/useSignupMutation";

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
  const {
    value: password,
    error: passwordError,
    onChange: onPasswordChange,
    isValidating: isPasswordValidating,
  } = useInputValidation("password");
  const {
    value: confirmPassword,
    error: confirmPasswordError,
    onChange: onConfirmPasswordChange,
    validate: validateConfirmPassword,
    isValidating: isConfirmPasswordValidating,
  } = useConfirmPasswordValidation(password);

  const navigate = useNavigate();

  const signupMutation = useSignupMutation({
    onSuccess: () => {
      const nextStep = getNextStepPath("password");
      navigate({
        to: nextStep,
      });
    },
  });

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
            signupMutation.mutate({
              email: useSignupStore.getState().email,
              password,
              service: true,
              privacy: true,
              ageVerification: true,
              marketing: useSignupStore.getState().isMarketingTermsAgreed,
            });
          }
        }}
      >
        <PasswordInputField
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
        <PasswordInputField
          label="비밀번호 재확인"
          id="confirmPassword"
          name="confirmPassword"
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          value={confirmPassword}
          placeholder="비밀번호를 입력해주세요."
          type="password"
          error={confirmPasswordError}
        />

        <p className="text-caption-m text-text-secondary">
          영문, 숫자, 특수문자가 포함된 8자 이상의 비밀번호를 입력해주세요.
        </p>
        <BlockButton
          disabled={
            !(
              !passwordError &&
              !confirmPasswordError &&
              password &&
              confirmPassword
            ) ||
            isPasswordValidating ||
            isConfirmPasswordValidating
          }
          isLoading={signupMutation.isPending}
        >
          완료
        </BlockButton>
      </form>
    </div>
  );
}
