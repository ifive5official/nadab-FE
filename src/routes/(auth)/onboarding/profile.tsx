import BlockButton from "@/components/BlockButton";
import { InputFieldWithButton } from "@/components/InputFields";
import StepTitle from "@/features/auth/StepTitle";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useInputValidation } from "@/hooks/useInputValidation";
import { getNextStepPath } from "@/features/auth/signupSteps";
import useOnboardingStore from "@/store/onboardingStore";
import ProfileImageUploader from "@/features/user/components/ProfileImageUploader";
import { useUpdateProfileMutation } from "@/features/user/hooks/useUpdateProfileMutation";
import { useCheckNicknameMutation } from "@/features/user/hooks/useCheckNicknameMutation";

export const Route = createFileRoute("/(auth)/onboarding/profile")({
  component: Profile,
  beforeLoad: () => {
    // 이전 단계 건너뛰는 것 방지
    const { category } = useOnboardingStore.getState();
    if (!category) {
      throw redirect({ to: "/onboarding/intro" });
    }
  },
});

function Profile() {
  const {
    value: nickname,
    error: nicknameError,
    setError: setNicknameError,
    onChange: onNicknameChange,
    isValidating: isNicknameValidating,
  } = useInputValidation("nickname");
  const [isNicknameOk, setIsNicknameOk] = useState(false);
  const [profileImgUrl, setProfileImgUrl] = useState<string | undefined>(
    undefined
  );

  const navigate = useNavigate();

  const checkNicknameMutation = useCheckNicknameMutation({
    onSuccess: (data) => {
      if (data.isAvailable) {
        setIsNicknameOk(true);
      } else {
        setNicknameError(data.reason ?? "");
      }
    },
    onNicknameInvalid: (message: string) => setNicknameError(message),
  });

  const updateProfileMutation = useUpdateProfileMutation({
    onSuccess: () => {
      const nextStep = getNextStepPath("profile");
      navigate({ to: nextStep });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        updateProfileMutation.mutate({
          nickname,
          objectKey: profileImgUrl,
        });
      }}
      className="h-full flex flex-col"
    >
      <div className="flex-1">
        <div className="py-padding-y-m">
          <StepTitle>프로필을 설정해주세요.</StepTitle>
        </div>
        <ProfileImageUploader
          mode="create"
          onSuccess={(url: string) => {
            setProfileImgUrl(url);
          }}
          className="py-padding-y-xl"
        />
        <div className="flex flex-col py-padding-y-m gap-gap-y-l">
          <InputFieldWithButton
            placeholder="닉네임을 입력해주세요."
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
            buttonDisabled={
              !(nickname && !nicknameError) || isNicknameValidating
            }
            onButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              checkNicknameMutation.mutate({ nickname });
            }}
          />
          <p className="text-caption-m text-text-secondary">
            2자 이상 10자 이하의 한글, 영문으로 구성된 닉네임을 작성해주세요.
          </p>
        </div>
      </div>

      <BlockButton
        isLoading={updateProfileMutation.isPending}
        disabled={!(nickname && !nicknameError && isNicknameOk)}
      >
        완료
      </BlockButton>
    </form>
  );
}
