import BlockButton from "@/components/BlockButton";
import { SubHeader } from "@/components/Headers";
import InputField from "@/components/InputFields";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <SubHeader>로그인</SubHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="flex flex-col py-padding-y-m gap-margin-y-m mb-margin-y-l"
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
        <BlockButton disabled={!password || !email}>완료</BlockButton>
      </form>
      <Link
        to="/password/forgot"
        className="inline-block w-full text-center text-label-m underline text-brand-primary"
      >
        비밀번호를 잊으셨나요?
      </Link>
    </div>
  );
}
