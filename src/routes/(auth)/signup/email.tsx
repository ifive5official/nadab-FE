import { createFileRoute, redirect } from "@tanstack/react-router";
import BlockButton from "@/components/BlockButton";
import { useInputValidation } from "@/hooks/useInputValidation";
import InputField from "@/components/InputFields";
import { useNavigate } from "@tanstack/react-router";
import StepTitle from "@/features/auth/StepTitle";
import { getNextStepPath } from "@/features/auth/signupSteps";
import useSignupStore from "@/store/signupStore";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useErrorStore from "@/store/errorStore";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/generated/api";

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

  const {
    value: email,
    error: emailError,
    onChange: onEmailChange,
    setError: setEmailError,
  } = useInputValidation("email");
  const navigate = useNavigate();

  // 중복 확인 + 인증 코드 전송
  const emailMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      await api.post("/api/v1/email/code", {
        email,
        verificationType: "SIGNUP",
      });
    },
    onSuccess: () => {
      // 이메일 중복 없으면 다음 단계로
      updateEmail(email);
      const nextStep = getNextStepPath("email");
      navigate({ to: nextStep });
    },
    onError: (err: AxiosError<ApiResponse<null>>) => {
      if (err.status === 409) {
        setEmailError("이미 가입한 회원이에요.");
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
      <div className="py-padding-y-m">
        <StepTitle>이메일을 입력해주세요.</StepTitle>
      </div>

      <form
        className="flex flex-col gap-gap-y-s"
        onSubmit={(e) => {
          e.preventDefault();
          if (!emailError) {
            emailMutation.mutate({ email });
          }
        }}
      >
        <InputField
          label="이메일 주소"
          id="email"
          name="email"
          onChange={(e) => onEmailChange(e.target.value)}
          value={email}
          placeholder="이메일을 입력해주세요."
          type="email"
          error={emailError}
          className="py-padding-y-m"
        />

        <BlockButton
          isLoading={emailMutation.isPending}
          disabled={!!emailError || !email}
        >
          완료
        </BlockButton>
      </form>
    </div>
  );
}
