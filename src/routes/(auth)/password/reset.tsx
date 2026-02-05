import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import useResetPasswordStore from "@/store/resetPasswordStore";
import {
  useInputValidation,
  useConfirmPasswordValidation,
} from "@/hooks/useInputValidation";
import StepTitle from "@/features/auth/StepTitle";
import { PasswordInputField } from "@/components/InputFields";
import BlockButton from "@/components/BlockButton";
import { getNextStepPath } from "@/features/auth/resetPasswordStep";
import useModalStore from "@/store/modalStore";
import { CircleCheckFilledIcon } from "@/components/Icons";
import { useFindPasswordMutation } from "@/features/auth/hooks/useFindPasswordMutation";

export const Route = createFileRoute("/(auth)/password/reset")({
  component: Reset,
  beforeLoad: () => {
    // 이전 단계 건너뛰는 것 방지
    const { isEmailVerified } = useResetPasswordStore.getState();
    if (!isEmailVerified) {
      throw redirect({ to: "/password/forgot" });
    }
  },
});

function Reset() {
  const email = useResetPasswordStore.use.email();
  const updatePassword = useResetPasswordStore.use.updatePassword();
  const {
    value: password,
    error: passwordError,
    onChange: onPasswordChange,
    setError: setPasswordError,
    isValidating: isPasswordValidating,
  } = useInputValidation("password");
  const {
    value: confirmPassword,
    error: confirmPasswordError,
    onChange: onConfirmPasswordChange,
    validate: validateConfirmPassword,
    isValidating: isConfirmpasswordValidating,
  } = useConfirmPasswordValidation(password);

  const navigate = useNavigate();

  const { showModal, closeModal } = useModalStore();

  const resetPasswordMutation = useFindPasswordMutation({
    onSuccess: () => {
      showModal({
        icon: CircleCheckFilledIcon,
        title: `비밀번호 변경에\n성공했어요.`,
        buttons: [
          {
            label: "확인",
            onClick: () => {
              closeModal();
              updatePassword(password);
              const nextStep = getNextStepPath("reset");
              navigate({ to: nextStep });
            },
          },
        ],
      });
    },
    onPasswordInvalid: (message: string) => {
      setPasswordError(message);
    },
  });
  return (
    <div>
      <div className="py-padding-y-m">
        <StepTitle>비밀번호를 재설정해주세요.</StepTitle>
      </div>

      <form
        className="flex flex-col gap-gap-y-m py-padding-y-m"
        onSubmit={(e) => {
          e.preventDefault();
          resetPasswordMutation.mutate({ email, newPassword: password });
        }}
      >
        <PasswordInputField
          label="새로운 비밀번호"
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
          label="새로운 비밀번호 재입력"
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
          isLoading={resetPasswordMutation.isPending}
          disabled={
            !(
              !passwordError &&
              !confirmPasswordError &&
              password &&
              confirmPassword
            ) ||
            isPasswordValidating ||
            isConfirmpasswordValidating
          }
        >
          완료
        </BlockButton>
      </form>
    </div>
  );
}
