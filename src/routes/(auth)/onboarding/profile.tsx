import BlockButton from "@/components/BlockButton";
import { InputFieldWithButton } from "@/components/InputFields";
import StepTitle from "@/features/auth/StepTitle";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useInputValidation } from "@/hooks/useInputValidation";
import BottomModal from "@/components/BottomModal";
import { AnimatePresence } from "motion/react";

export const Route = createFileRoute("/(auth)/onboarding/profile")({
  component: Profile,
});

function Profile() {
  const {
    value: nickname,
    error: nicknameError,
    onChange: onNicknameChange,
  } = useInputValidation("nickname");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const albumInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <div className="py-margin-y-m">
          <StepTitle>프로필을 설정해주세요.</StepTitle>
        </div>
        <div className="py-padding-y-xl flex flex-col items-center gap-margin-y-s">
          <img src="/default-profile.png" className="h-16 w-16 rounded-full" />
          {/* <div className="bg-neutral-300 h-16 w-16 rounded-full" /> */}
          <button
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
          <AnimatePresence>
            {isModalOpen && (
              <BottomModal
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
            )}
          </AnimatePresence>
        </div>
        <div className="py-padding-y-m">
          <InputFieldWithButton
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            error={nicknameError}
            label="닉네임"
            buttonLabel="중복 검사"
            buttonDisabled={!(nickname && !nicknameError)}
            onButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
            }}
          />
          <p className="text-caption-m text-neutral-800 mt-margin-y-m">
            2자 이상 10자 이하의 한글, 영문으로 구성된 닉네임을 작성해주세요.
          </p>
        </div>
      </div>
      {/* Todo: 중복 검사 결과 disabled 조건에 포함 */}
      <BlockButton disabled={!(nickname && !nicknameError)}>완료</BlockButton>
    </div>
  );
}
