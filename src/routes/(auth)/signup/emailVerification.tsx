import { createFileRoute, redirect } from "@tanstack/react-router";
import BlockButton from "@/components/BlockButton";
import useSignupStore from "@/store/signupStore";
import { useEffect, useRef, useState } from "react";
import { OtpInput } from "@/components/InputFields";
import { useNavigate } from "@tanstack/react-router";
import StepTitle from "@/features/auth/StepTitle";
import { getNextStepPath } from "@/features/auth/signupSteps";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/(auth)/signup/emailVerification")({
  component: EmailVerification,
  beforeLoad: () => {
    // 이전 단계 건너뛰는 것 방지
    const { email } = useSignupStore.getState();
    if (!email) {
      throw redirect({ to: "/signup/terms" });
    }
  },
});

function EmailVerification() {
  const updateIsEmailVerified = useSignupStore.use.updateIsEmailVerified();
  const email = useSignupStore.use.email();
  const [enteredCode, setEnteredCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState(180); // 3분

  const resendCodeMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      // Todo: 인증번호 전송 백엔드 api 연동
      alert(email + "로 인증번호 재전송: 123456");
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { email };
    },
    // Todo: 에러 처리(토스트 보여줄 예정)
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async ({ enteredCode }: { enteredCode: string }) => {
      // Todo: 인증번호 확인 백엔드 api 연동
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (enteredCode !== "123456") {
        throw new Error("인증번호 확인 실패");
      }
      return { enteredCode };
    },
    onSuccess: () => {
      updateIsEmailVerified();
      const nextStep = getNextStepPath("emailVerification");
      navigate({
        to: nextStep,
      });
    },

    onError: (error) => {
      if (error.message === "인증번호 확인 실패") {
        setError("입력한 정보를 한번 더 확인해주세요.");
      } else {
        // Todo: 에러 처리(토스트 보여줄 예정)
      }
    },
  });

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // 1초마다
  }

  // 진입 시 타이머 설졍
  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  });

  function handleResend() {
    setTimeLeft(180);
    startTimer();
    resendCodeMutation.mutate({ email });
  }

  return (
    <form
      className="flex flex-col gap-gap-y-xl py-padding-y-m"
      action=""
      onSubmit={(e) => {
        e.preventDefault();
        verifyCodeMutation.mutate({ enteredCode });
      }}
    >
      <StepTitle>
        메일로 전송된
        <br />
        인증번호 6자리를 입력해 주세요
      </StepTitle>
      <div className="flex flex-col gap-gap-y-l">
        <OtpInput
          length={6}
          error={error}
          onChange={(code: string) => {
            setError("");
            setEnteredCode(code);
          }}
        />
        <p className="text-center text-label-m text-text-tertiary">
          <span>
            {Math.floor(timeLeft / 60)
              .toString()
              .padStart(2, "0")}
            :{(timeLeft % 60).toString().padStart(2, "0")}
          </span>{" "}
          내에 입력해주세요
        </p>
      </div>

      <BlockButton
        isLoading={verifyCodeMutation.isPending}
        disabled={enteredCode.length !== 6}
      >
        완료
      </BlockButton>
      <p className="text-center text-label-m text-text-primary">
        인증번호가 오지 않았나요?{" "}
        <button onClick={handleResend} className="text-brand-primary underline">
          재발송
        </button>
      </p>
    </form>
  );
}
