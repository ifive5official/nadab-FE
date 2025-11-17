import BlockButton from "@/components/BlockButton";
import { InputFieldWithButton } from "@/components/InputFields";
import StepTitle from "@/features/auth/StepTitle";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserSchema } from "@/features/user/userSchema";
import { useDebouncedCallback } from "use-debounce";

export const Route = createFileRoute("/(auth)/onboarding/profile")({
  component: Profile,
});

function Profile() {
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");

  const validateNickname = useDebouncedCallback((value: string) => {
    const NicknameSchema = UserSchema.pick({ nickname: true });
    const result = NicknameSchema.safeParse({ nickname: value });
    if (!result.success) {
      setNicknameError(result.error.issues[0].message);
    } else {
      setNicknameError("");
    }
  }, 300);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <div className="py-margin-y-m">
          <StepTitle>프로필을 설정해주세요.</StepTitle>
        </div>
        <div className="py-padding-y-xl flex flex-col items-center gap-margin-y-s">
          <img src="/default-profile.png" className="h-16 w-16 rounded-full" />
          {/* <div className="bg-neutral-300 h-16 w-16 rounded-full" /> */}
          <button className="text-interactive-text-primary text-label-m underline">
            사진 추가
          </button>
        </div>
        <div className="py-padding-y-m">
          <InputFieldWithButton
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setNicknameError(""); // 입력 중 에러 문구 X
              validateNickname(e.target.value);
            }}
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
