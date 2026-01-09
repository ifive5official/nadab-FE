import { createFileRoute, useNavigate } from "@tanstack/react-router";
import BlockButton from "@/components/BlockButton";
import { PasswordInputField } from "@/components/InputFields";
import StepTitle from "@/features/auth/StepTitle";
import {
  useInputValidation,
  useConfirmPasswordValidation,
} from "@/hooks/useInputValidation";
import { SubHeader } from "@/components/Headers";
import { useChangePasswordMutation } from "@/features/auth/hooks/useChangePasswordMutation";
import { useState } from "react";
import Modal from "@/components/Modal";
import { CircleCheckFilledIcon } from "@/components/Icons";
import Container from "@/components/Container";

export const Route = createFileRoute("/_authenticated/account/password")({
  component: RouteComponent,
});

export function RouteComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    value: prevPassword,
    error: prevPasswordError,
    onChange: onPrevPasswrodChange,
    setError: setPrevPasswordError,
    isValidating: isPrevPasswordValidating,
  } = useInputValidation("password");
  const {
    value: newPassword,
    error: newPasswordError,
    onChange: onNewPasswordChange,
    setError: setNewPasswordError,
    isValidating: isNewPasswordValidating,
  } = useInputValidation("password");
  const {
    value: confirmPassword,
    error: confirmPasswordError,
    onChange: onConfirmPasswordChange,
    validate: validateConfirmPassword,
    isValidating: isConfirmPasswordValidating,
  } = useConfirmPasswordValidation(newPassword);

  const navigate = useNavigate();

  const changePasswordMutation = useChangePasswordMutation({
    onSuccess: () => {
      setIsModalOpen(true);
    },
    onPasswordInvalid: (code: string) => {
      if (code === "AUTH_INVALID_PASSWORD") {
        setPrevPasswordError("현재 비밀번호와 일치하지 않아요.");
      } else if (code === "AUTH_SOCIAL_ACCOUNT_PASSWORD_CHANGE_FORBIDDEN") {
        setPrevPasswordError("소셜 로그인 계정은 비밀번호를 변경할 수 없어요.");
      } else if (code === "AUTH_PASSWORD_REUSE_NOT_ALLOWED") {
        setNewPasswordError("기존과 동일한 비밀번호로 변경할 수 없어요.");
      }
    },
  });

  return (
    <>
      <SubHeader showMenuButton={false}>비밀번호 변경</SubHeader>
      <Container>
        <div className="py-padding-y-m">
          <StepTitle>비밀번호를 재설정해주세요.</StepTitle>
        </div>

        <form
          className="flex flex-col gap-gap-y-l py-padding-y-m"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              !prevPasswordError &&
              !newPasswordError &&
              !confirmPasswordError
            ) {
              changePasswordMutation.mutate({
                currentPassword: prevPassword,
                newPassword,
              });
            }
          }}
        >
          <PasswordInputField
            label="현재 비밀번호"
            id="password"
            name="password"
            onChange={(e) => {
              onPrevPasswrodChange(e.target.value);
              if (confirmPassword) {
                validateConfirmPassword();
              }
            }}
            value={prevPassword}
            placeholder="현재 비밀번호를 입력해주세요."
            type="password"
            error={prevPasswordError}
          />
          <PasswordInputField
            label="새로운 비밀번호"
            id="password"
            name="password"
            onChange={(e) => {
              onNewPasswordChange(e.target.value);
              if (confirmPassword) {
                validateConfirmPassword();
              }
            }}
            value={newPassword}
            placeholder="새로운 비밀번호를 입력해주세요."
            type="password"
            error={newPasswordError}
          />
          <PasswordInputField
            label="새로운 비밀번호 재입력"
            id="confirmPassword"
            name="confirmPassword"
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            value={confirmPassword}
            placeholder="새로운 비밀번호를 재입력해주세요."
            type="password"
            error={confirmPasswordError}
          />

          <p className="text-caption-m text-text-secondary">
            영문, 숫자, 특수문자가 포함된 8자 이상의 비밀번호를 입력해주세요.
          </p>
          <BlockButton
            disabled={
              !(
                !prevPasswordError &&
                !newPasswordError &&
                !confirmPasswordError &&
                prevPassword &&
                newPassword &&
                confirmPassword
              ) ||
              isPrevPasswordValidating ||
              isNewPasswordValidating ||
              isConfirmPasswordValidating
            }
            isLoading={changePasswordMutation.isPending}
          >
            완료
          </BlockButton>
        </form>
        <Modal
          isOpen={isModalOpen}
          icon={CircleCheckFilledIcon}
          title={`비밀번호 변경에\n성공했어요.`}
          buttons={[
            {
              label: "확인",
              onClick: () => {
                setIsModalOpen(false);
                navigate({ to: "/account" });
              },
            },
          ]}
          onClose={() => setIsModalOpen(false)}
        />
      </Container>
    </>
  );
}
