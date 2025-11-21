import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import useResetPasswordStore from "@/store/resetPasswordStore";
import {
  useInputValidation,
  useConfirmPasswordValidation,
} from "@/hooks/useInputValidation";
import StepTitle from "@/features/auth/StepTitle";
import InputField from "@/components/InputFields";
import BlockButton from "@/components/BlockButton";
import { getNextStepPath } from "@/features/auth/resetPasswordStep";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Modal from "@/components/Modal";
import { CircleCheckFilledIcon } from "@/components/Icons";

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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      // Todo: 비밀번호 변경 백엔드 api 연동
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { password };
    },
    onSuccess: () => {
      setIsModalOpen(true);
    },
    // Todo: 에러 처리(토스트 보여줄 예정)
  });

  return (
    <div>
      <div className="my-margin-y-m">
        <StepTitle>비밀번호를 설정해주세요.</StepTitle>
      </div>

      <form
        className="flex flex-col gap-margin-y-m py-padding-y-m"
        onSubmit={(e) => {
          e.preventDefault();
          resetPasswordMutation.mutate({ password });
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
          isLoading={resetPasswordMutation.isPending}
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
      <Modal
        isOpen={isModalOpen}
        icon={CircleCheckFilledIcon}
        title={`비밀번호 변경에\n성공했어요!`}
        buttons={[
          {
            label: "확인",
            onClick: () => {
              setIsModalOpen(false);
              updatePassword(password);
              const nextStep = getNextStepPath("reset");
              navigate({ to: nextStep });
            },
          },
        ]}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
