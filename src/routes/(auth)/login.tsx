import BlockButton from "@/components/BlockButton";
import { SubHeader } from "@/components/Headers";
import InputField, { PasswordInputField } from "@/components/InputFields";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import useResetPasswordStore from "@/store/resetPasswordStore";
import { useLoginMutation } from "@/features/auth/hooks/useLoginMutation";
import Container from "@/components/Container";
import { useInputValidation } from "@/hooks/useInputValidation";
export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const resetPasswordStore = useResetPasswordStore.use.reset();
  const {
    value: email,
    error: emailError,
    onChange: onEmailChange,
    setError: setEmailError,
    isValidating: isEmailValidating,
  } = useInputValidation("email");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const loginMutation = useLoginMutation({
    onEmailInvalid: (message: string) => setEmailError(message),
    onPasswordInvalid: (message: string) => setPasswordError(message),
  });

  return (
    <>
      <SubHeader showMenuButton={false}>로그인</SubHeader>
      <Container>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loginMutation.mutate({ email, password });
          }}
          className="flex flex-col pt-padding-y-m gap-gap-y-l mb-margin-y-xl"
        >
          <InputField
            label="이메일"
            id="email"
            name="email"
            type="email"
            onChange={(e) => onEmailChange(e.target.value)}
            error={emailError}
            value={email}
            placeholder="이메일을 입력해주세요."
          />
          <PasswordInputField
            label="비밀번호"
            id="password"
            name="password"
            type="password"
            onChange={(e) => {
              setPasswordError("");
              setPassword(e.target.value);
            }}
            error={passwordError}
            value={password}
            placeholder="비밀번호를 입력해주세요."
          />
          <BlockButton
            isLoading={loginMutation.isPending}
            disabled={!password || !email || !!emailError || isEmailValidating}
          >
            로그인
          </BlockButton>
        </form>
        <Link
          to="/password/forgot"
          className="inline-block w-full text-center text-label-m underline text-brand-primary"
          onClick={resetPasswordStore}
        >
          비밀번호를 잊으셨나요?
        </Link>
      </Container>
    </>
  );
}
