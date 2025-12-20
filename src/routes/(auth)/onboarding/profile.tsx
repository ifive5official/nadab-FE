import BlockButton from "@/components/BlockButton";
import { InputFieldWithButton } from "@/components/InputFields";
import StepTitle from "@/features/auth/StepTitle";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useInputValidation } from "@/hooks/useInputValidation";
import { useMutation } from "@tanstack/react-query";
import { getNextStepPath } from "@/features/auth/signupSteps";
import useOnboardingStore from "@/store/onboardingStore";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/generated/api";
import useErrorStore from "@/store/errorStore";
import type { components } from "@/generated/api-types";
import ProfileImageUploader from "@/features/user/ProfileImageUploader";

type NicknameRes = components["schemas"]["CheckNicknameResponse"];

export const Route = createFileRoute("/(auth)/onboarding/profile")({
  component: Profile,
  beforeLoad: () => {
    // 이전 단계 건너뛰는 것 방지
    const { category } = useOnboardingStore.getState();
    if (!category) {
      throw redirect({ to: "/signup/terms" });
    }
  },
});

function Profile() {
  const onboardingStore = useOnboardingStore.getState();

  const {
    value: nickname,
    error: nicknameError,
    setError: setNicknameError,
    onChange: onNicknameChange,
  } = useInputValidation("nickname");
  const [isNicknameOk, setIsNicknameOk] = useState(false);

  const navigate = useNavigate();

  const checkNicknameMutation = useMutation({
    mutationFn: async ({ nickname }: { nickname: string }) => {
      const res = await api.get<ApiResponse<NicknameRes>>(
        `/api/v1/user/check-nickname?nickname=${nickname}`
      );
      return res;
    },
    onSuccess: (res) => {
      if (res.data.data?.isAvailable) {
        setIsNicknameOk(true);
      } else {
        setNicknameError(res.data.data?.reason ?? "");
      }
    },

    onError: (err: AxiosError<ApiResponse<null>>) => {
      if (err.status === 409) {
        setNicknameError("이미 가입한 회원이에요.");
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

  // Todo: 수정
  const signupMutation = useMutation({
    mutationFn: async ({ nickname }: { nickname: string }) => {
      // Todo: 회원가입 백엔드 api 연동
      const user = {
        category: onboardingStore.category,
        nickname,
        profileImgUrl: onboardingStore.profileImgUrl,
      };
      alert(`${JSON.stringify(user)} 회원가입`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { nickname };
    },
    onSuccess: () => {
      const nextStep = getNextStepPath("profile");
      navigate({ to: nextStep });
    },
    // Todo: 에러 처리(토스트 보여줄 예정)
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        signupMutation.mutate({ nickname });
      }}
      className="h-full flex flex-col"
    >
      <div className="flex-1">
        <div className="py-padding-y-m">
          <StepTitle>프로필을 설정해주세요.</StepTitle>
        </div>
        <ProfileImageUploader
          onSuccess={(url: string) => {
            const setProfileImgUrl =
              useOnboardingStore.use.updateProfileImgUrl();
            setProfileImgUrl(url);
          }}
        />
        <div className="flex flex-col py-padding-y-m gap-gap-y-l">
          <InputFieldWithButton
            value={nickname}
            onChange={(e) => {
              setIsNicknameOk(false);
              onNicknameChange(e.target.value);
            }}
            error={nicknameError}
            isOk={isNicknameOk}
            isLoading={checkNicknameMutation.isPending}
            label="닉네임"
            id="nickname"
            buttonLabel="중복 검사"
            buttonDisabled={!(nickname && !nicknameError)}
            onButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              checkNicknameMutation.mutate({ nickname });
            }}
          />
          <p className="text-caption-m text-neutral-800">
            2자 이상 10자 이하의 한글, 영문으로 구성된 닉네임을 작성해주세요.
          </p>
        </div>
      </div>

      <BlockButton
        // isLoading={signupMutation.isPending}
        disabled={!(nickname && !nicknameError && isNicknameOk)}
      >
        완료
      </BlockButton>
    </form>
  );
}
