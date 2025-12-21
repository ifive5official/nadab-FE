import BlockButton from "@/components/BlockButton";
import { SubHeader } from "@/components/Headers";
import InputField, { PasswordInputField } from "@/components/InputFields";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import useResetPasswordStore from "@/store/resetPasswordStore";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/generated/api";

export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const resetPasswordStore = useResetPasswordStore.use.reset();
  const [email, setEmail] = useState("");
  // const [emailError, setEmailError] = useState("")
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      await api.post("/api/v1/auth/login", {
        email,
        password,
      });
    },
    onSuccess: () => {
      navigate({ to: "/" });
    },
    onError: (err: AxiosError<ApiResponse<null>>) => {
      if (
        err.response?.status === 400 ||
        err.response?.status === 401 ||
        err.response?.status === 404
      ) {
        setPasswordError("잘못된 비밀번호입니다. 다시 확인하세요.");
        // 명시적으로 분리해서 메시지를 주는 게 나을까?
      } else {
        useErrorStore.getState().showError(
          // Todo: 에러 메시지 변경
          err.message,
          err.response?.data?.message ??
            "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요."
        );
      }
    },
  });

  return (
    <div>
      <SubHeader>로그인</SubHeader>
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
    </div>
  );
}
