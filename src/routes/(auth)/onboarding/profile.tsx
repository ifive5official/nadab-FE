import BlockButton from "@/components/BlockButton";
import { InputFieldWithButton } from "@/components/InputFields";
import StepTitle from "@/features/auth/StepTitle";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useInputValidation } from "@/hooks/useInputValidation";
import BottomModal from "@/components/BottomModal";
import { useMutation } from "@tanstack/react-query";
import { getNextStepPath } from "@/features/auth/signupSteps";
import useSignupStore from "@/store/signupStore";

export const Route = createFileRoute("/(auth)/onboarding/profile")({
  component: Profile,
});

function Profile() {
  const signupStore = useSignupStore.getState();

  const {
    value: nickname,
    error: nicknameError,
    onChange: onNicknameChange,
  } = useInputValidation("nickname");
  const [isNicknameOk, setIsNicknameOk] = useState(false);
  // Todo: 이미지 업로드
  const [profileImgUrl] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const albumInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();

  const checkNicknameMutation = useMutation({
    mutationFn: async ({ nickname }: { nickname: string }) => {
      // Todo: 닉네임 중복 확인 백엔드 api 연동
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { nickname };
    },
    onSuccess: () => {
      setIsNicknameOk(true);
    },

    // Todo: 에러 처리
  });

  const signupMutation = useMutation({
    mutationFn: async ({
      nickname,
      profileImgUrl,
    }: {
      nickname: string;
      profileImgUrl: string;
    }) => {
      // Todo: 회원가입 백엔드 api 연동
      const user = {
        email: signupStore.email,
        password: signupStore.password,
        category: signupStore.category,
        nickname,
        profileImgUrl,
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
        signupMutation.mutate({ nickname, profileImgUrl });
      }}
      className="h-full flex flex-col"
    >
      <div className="flex-1">
        <div className="py-padding-y-m">
          <StepTitle>프로필을 설정해주세요.</StepTitle>
        </div>
        <div className="py-padding-y-xl flex flex-col items-center gap-gap-y-s">
          <img src="/default-profile.png" className="h-16 w-16 rounded-full" />
          {/* <div className="bg-neutral-300 h-16 w-16 rounded-full" /> */}
          <button
            type="button"
            className="text-interactive-text-primary text-label-m underline"
            onClick={() => setIsModalOpen(true)}
          >
            사진 추가
          </button>
          <input
            ref={albumInputRef}
            type="file"
            className="hidden"
            accept="image/*"
          />
          <input
            ref={cameraInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            capture="environment"
          />

          <BottomModal
            isOpen={isModalOpen}
            title="프로필 사진 추가"
            items={[
              {
                label: "앨범에서 사진 선택",
                onClick: () => {
                  albumInputRef.current?.click();
                },
              },
              {
                label: "사진 찍기",
                onClick: () => {
                  cameraInputRef.current?.click();
                },
              },
              {
                label: "취소",
                onClick: () => setIsModalOpen(false),
              },
            ]}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
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
      {/* Todo: 중복 검사 결과 disabled 조건에 포함 */}
      <BlockButton
        isLoading={signupMutation.isPending}
        disabled={!(nickname && !nicknameError && isNicknameOk)}
      >
        완료
      </BlockButton>
    </form>
  );
}
