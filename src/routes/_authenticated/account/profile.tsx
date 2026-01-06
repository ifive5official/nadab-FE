import { SubHeader } from "@/components/Headers";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useInputValidation } from "@/hooks/useInputValidation";
import { useCheckNicknameMutation } from "@/features/user/hooks/useCheckNicknameMutation";
import { useState } from "react";
import { useUpdateProfileMutation } from "@/features/user/hooks/useUpdateProfileMutation";
import ProfileImageUploader from "@/features/user/components/ProfileImageUploader";
import BlockButton from "@/components/BlockButton";
import InputField, { InputFieldWithButton } from "@/components/InputFields";
import { useSuspenseQuery } from "@tanstack/react-query";
import { currentUserOptions } from "@/features/user/quries";
import { useDeleteProfileMutation } from "@/features/user/hooks/useDeleteProfileImageMutation";
import Container from "@/components/Container";

export const Route = createFileRoute("/_authenticated/account/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  const initialNickname = currentUser.nickname;
  const initialProfileImgUrl = currentUser.profileImageUrl!;
  const {
    value: nickname,
    error: nicknameError,
    setError: setNicknameError,
    onChange: onNicknameChange,
    isValidating: isNicknameValidating,
  } = useInputValidation("nickname", initialNickname);
  const [isNicknameOk, setIsNicknameOk] = useState(false);

  // 프로필 이미지 삭제 시 빈 문자열("") 들어옴
  const [profileImgUrl, setProfileImgUrl] =
    useState<string>(initialProfileImgUrl);

  const isNicknameChanged = nickname !== initialNickname;
  const isProfileImgChanged = profileImgUrl !== initialProfileImgUrl;
  const isProfileImgDeleted = profileImgUrl === "";
  // 닉네임 중복 체크 통과 여부 - 닉네임 변경 여부 고려
  const isNicknameReady = isNicknameChanged ? isNicknameOk : true;
  const checkNicknameMutation = useCheckNicknameMutation({
    onSuccess: (data) => {
      if (data.isAvailable) {
        setIsNicknameOk(true);
      } else {
        setNicknameError(data.reason ?? "");
      }
    },
  });

  const deleteProfileImageMutation = useDeleteProfileMutation();
  const updateProfileMutation = useUpdateProfileMutation({});

  return (
    <>
      <SubHeader>프로필 수정</SubHeader>
      <Container>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const tasks = [];
            // 프로필 이미지 삭제했으면 삭제 api 먼저 호출
            if (isProfileImgDeleted) {
              tasks.push(deleteProfileImageMutation.mutateAsync());
            }
            if (
              isNicknameChanged ||
              (isProfileImgChanged && !isProfileImgDeleted)
            ) {
              // 변경했으면 변경한 값, 변경하지 않았을 시 비워서 보냄
              tasks.push(
                updateProfileMutation.mutateAsync({
                  nickname: isNicknameChanged ? nickname : undefined,
                  objectKey:
                    isProfileImgChanged && !isProfileImgDeleted
                      ? profileImgUrl
                      : undefined,
                })
              );
            }
            try {
              await Promise.all(tasks);
              navigate({ to: "/account" });
            } catch (err) {
              // 이미 각 뮤테이션 훅에서 처리했으므로 아무것도 하지 않음
              console.error(err);
            }
          }}
          className="flex-1 flex flex-col"
        >
          <div className="flex-1">
            <ProfileImageUploader
              mode="edit"
              initialProfileImgUrl={initialProfileImgUrl}
              onSuccess={(url: string) => {
                setProfileImgUrl(url);
              }}
              className="py-padding-y-m"
            />
            <div className="flex flex-col py-padding-y-m gap-gap-y-l">
              <InputField
                label="이메일"
                disabled
                placeholder={currentUser.email}
              />
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
                  !(nickname && !nicknameError && isNicknameChanged) ||
                  isNicknameValidating
                }
                onButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  checkNicknameMutation.mutate({ nickname });
                }}
              />
              <p className="text-caption-m text-text-secondary">
                2자 이상 10자 이하의 한글, 영문으로 구성된 닉네임을
                작성해주세요.
                <br />
                닉네임 변경은 14일 내에 최대 2번까지 가능해요.
              </p>
            </div>
          </div>

          <BlockButton
            isLoading={
              updateProfileMutation.isPending ||
              deleteProfileImageMutation.isPending
            }
            disabled={
              !(isNicknameChanged || isProfileImgChanged) ||
              !(nickname && !nicknameError && isNicknameReady)
            }
          >
            저장
          </BlockButton>
        </form>
      </Container>
    </>
  );
}
