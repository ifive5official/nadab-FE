import { createFileRoute, redirect } from "@tanstack/react-router";
import BlockButton from "@/components/BlockButton";
import { useState } from "react";
import { UserSchema } from "@/features/user/userSchema";
import { useDebouncedCallback } from "use-debounce";
import InputField from "@/components/InputFields";
import { useNavigate } from "@tanstack/react-router";
import StepTitle from "@/features/auth/StepTitle";
import { getNextStepPath } from "@/features/auth/signupSteps";
import useSignupStore from "@/store/signupStore";

export const Route = createFileRoute("/(auth)/signup/email")({
  component: Email,
  beforeLoad: () => {
    // 이전 단계 건너뛰는 것 방지
    const { isTermsAgreed } = useSignupStore.getState();
    if (!isTermsAgreed) {
      throw redirect({ to: "/signup/terms" });
    }
  },
});

export default function Email() {
  const updateEmail = useSignupStore.use.updateEmail();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  // 입력 후 일정 시간이 지나고 검증
  const validateEmail = useDebouncedCallback((value: string) => {
    const EmailSchema = UserSchema.pick({ email: true });
    const result = EmailSchema.safeParse({ email: value });
    if (!result.success) {
      setEmailError(result.error.issues[0].message);
    } else {
      setEmailError("");
    }
  }, 300);

  return (
    <div>
      <div className="my-margin-y-m">
        <StepTitle>이메일을 입력해주세요.</StepTitle>
      </div>

      <form
        className="flex flex-col gap-margin-y-s"
        onSubmit={(e) => {
          e.preventDefault();
          if (!emailError) {
            // Todo: 중복 확인 api 호출 + 로딩 상태 UI 반영
            // 모바일 페이지 전환 애니메이션 관련 이슈로 인해 추가
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
            updateEmail(email);
            const nextStep = getNextStepPath("email");
            // 모바일 freeze 이슈때문에 넣음
            // 더 나은 해결방법 나올 때까지 지우지 말 것
            Promise.resolve().then(() => {
              navigate({ to: nextStep });
            });
          }
        }}
      >
        <div className="my-margin-y-m">
          <InputField
            label="이메일 주소"
            id="email"
            name="email"
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(""); // 입력 중 에러 문구 X
              validateEmail(e.target.value);
            }}
            value={email}
            placeholder="이메일을 입력해주세요."
            type="email"
            error={emailError}
          />
        </div>

        <BlockButton disabled={!!emailError || !email}>완료</BlockButton>
      </form>
    </div>
  );
}
