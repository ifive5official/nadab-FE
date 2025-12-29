import BlockButton from "@/components/BlockButton";
import { SubHeader } from "@/components/Headers";
import InputField, { PasswordInputField } from "@/components/InputFields";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import useResetPasswordStore from "@/store/resetPasswordStore";
import { useLoginMutation } from "@/features/auth/hooks/useLoginMutation";
import Container from "@/components/Container";
export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const resetPasswordStore = useResetPasswordStore.use.reset();
  const [email, setEmail] = useState("");
  // const [emailError, setEmailError] = useState("")
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const loginMutation = useLoginMutation({
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
            name="id"
            type="email"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            value={email}
            placeholder="이메일을 입력해주세요."
          />
          <PasswordInputField
            label="비밀번호"
            id="password"
            name="id"
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
            disabled={!password || !email}
          >
            완료
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
