import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import BlockButton from "@/components/BlockButton";
import useSignupStore from "@/store/signupStore";
import InputField from "@/components/InputFields";
import StepTitle from "@/features/auth/StepTitle";
import { getNextStepPath } from "@/features/auth/signupSteps";
import {
  useInputValidation,
  useConfirmPasswordValidation,
} from "@/hooks/useInputValidation";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/generated/api";
import useErrorStore from "@/store/errorStore";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";
import useAuthStore from "@/store/authStore";

type TokenRes = components["schemas"]["TokenResponse"];

export const Route = createFileRoute("/(auth)/signup/password")({
  component: Password,
  beforeLoad: () => {
    // 이전 단계 건너뛰는 것 방지
    const { isEmailVerified } = useSignupStore.getState();
    if (!isEmailVerified) {
      throw redirect({ to: "/signup/terms" });
    }
  },
});

export default function Password() {
  const updatePassword = useSignupStore.use.updatePassword();
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

  const signupMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const res = await api.post<ApiResponse<TokenRes>>("/api/v1/auth/signup", {
        email: useSignupStore.getState().email,
        password: password,
      });
      return res.data;
    },
    onSuccess: (res) => {
      const { accessToken } = res.data!;
      useAuthStore.getState().setAccessToken(accessToken!);
      updatePassword(password);
      const nextStep = getNextStepPath("password");
      navigate({
        to: nextStep,
      });
    },
    onError: (err: AxiosError<ApiResponse<null>>) => {
      useErrorStore.getState().showError(
        // Todo: 에러 메시지 변경
        err.message,
        err.response?.data?.message ??
          "알 수 없는 에러가 발생했습니다. 다시 시도해 주세요."
      );
    },
  });

  return (
    <div>
      <div className="py-padding-y-m">
        <StepTitle>비밀번호를 설정해주세요.</StepTitle>
      </div>

      <form
        className="flex flex-col gap-gap-y-l py-padding-y-m"
        onSubmit={(e) => {
          e.preventDefault();
          if (!passwordError && !confirmPasswordError) {
            signupMutation.mutate({ password });
          }
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
    </div>
  );
}
