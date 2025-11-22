import BlockButton from "@/components/BlockButton";
import { SubHeader } from "@/components/Headers";
import InputField from "@/components/InputFields";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import useResetPasswordStore from "@/store/resetPasswordStore";

export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const resetPasswordStore = useResetPasswordStore.use.reset();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      // Todo: 백엔드 api 연동
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ email, password });
        }, 300);
      });
    },
    onSuccess: () => {
      navigate({ to: "/" });
    },
    // Todo: 에러 처리(토스트 보여줄 예정)
  });

  return (
    <div>
      <SubHeader>로그인</SubHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutate({ email, password });
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
        <InputField
          label="비밀번호"
          id="password"
          name="id"
          type="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          value={password}
          placeholder="비밀번호를 입력해주세요."
        />
        {/* todo: 백엔드 연동 */}
        <BlockButton isLoading={isPending} disabled={!password || !email}>
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
