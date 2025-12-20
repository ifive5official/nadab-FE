import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SubHeader } from "@/components/Headers";
import BlockButton from "@/components/BlockButton";
import initialCategories from "@/constants/categories";
import { useState } from "react";
import clsx from "clsx";
import { ChevronRightIcon, MenuIcon } from "@/components/Icons";
import Switch from "@/components/Switch";
import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import useAuthStore from "@/store/authStore";

export const Route = createFileRoute("/_main/(account)/account")({
  component: RouteComponent,
  //   Todo: 비로그인 사용자 접근 막기
});

function RouteComponent() {
  // Todo: 백엔드 연동해서 내 정보 받아와 초기값 설정
  const categories = initialCategories.map((category) => ({
    ...category,
    isSelected: category.title === "취향" ? true : false,
  }));
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navigate = useNavigate();
  const clearAuth = useAuthStore.use.clearAuth();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/api/v1/auth/logout");
    },
    onSuccess: () => {
      clearAuth();
      //   Todo: 사용자 관련 캐시 제거
      navigate({ to: "/" });
    },
    // Todo: 에러 처리
  });

  return (
    <div>
      <SubHeader>마이페이지</SubHeader>
      <div className="py-padding-y-m flex flex-col gap-gap-y-l">
        <div className="flex items-center gap-gap-x-l">
          <img
            src="/default-profile.png"
            className="rounded-full aspect-square h-[53px]"
          ></img>
          <div className="flex flex-col gap-y-xs">
            <p className="text-text-primary text-title-3">알케르닉스</p>
            <p className="text-neutral-600 text-caption-l">
              alchernix149@naver.com
            </p>
          </div>
        </div>
        <BlockButton
          variant="tertiary"
          className="py-padding-y-s text-button-2"
        >
          프로필 수정
        </BlockButton>
      </div>
      <div className="relative -mx-padding-x-m py-gap-y-s">
        <div className="bg-surface-layer-1 w-full h-gap-y-s " />
      </div>

      <div className="bg-surface-layer-1 rounded-xl my-margin-y-s">
        <ul className="text-text-primary flex flex-col">
          <Section title="관심 주제" Icon={MenuIcon}>
            <ul className="grid grid-cols-2 gap-margin-y-s py-padding-y-xs">
              {categories.map((category) => {
                return (
                  <div
                    key={category.title}
                    className={clsx(
                      "text-label-m rounded-xl border py-padding-y-xs text-center",
                      category.isSelected
                        ? "text-interactive-text-default bg-interactive-bg-muted border-interactive-border-hover"
                        : "text-text-disabled bg-surface-base border-interactive-border-muted"
                    )}
                  >
                    {category.title}
                  </div>
                );
              })}
            </ul>
          </Section>
          <SectionDivider />
          <Section
            title="알림 시간"
            info={
              <div className="text-caption-m text-brand-primary border border-brand-primary rounded-full px-padding-x-xs py-padding-y-xxs mr-gap-x-s">
                08 : 00 AM
              </div>
            }
            Icon={MenuIcon}
          />
          <SectionDivider />
          <Section title="테마">
            <SectionItem
              title="다크 모드"
              rightElement={
                <Switch
                  isOn={isDarkMode}
                  onClick={() => setIsDarkMode((prev) => !prev)}
                />
              }
            />
          </Section>
          <SectionDivider />
          <Section title="계정 관리">
            <Link to="/password/forgot">
              <SectionItem
                title="비밀번호 변경"
                rightElement={<ChevronRightIcon />}
              />
            </Link>
            <SectionItem
              onClick={() => logoutMutation.mutate()}
              title="로그아웃"
              rightElement={<ChevronRightIcon />}
            />
            <SectionItem title="회원탈퇴" rightElement={<ChevronRightIcon />} />
          </Section>
        </ul>
      </div>
    </div>
  );
}

type SectionProps = {
  title: string;
  info?: React.ReactNode;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: React.ReactNode;
};

function Section({ title, info, Icon, children }: SectionProps) {
  return (
    <li className="py-padding-y-xs px-padding-x-m">
      <div className="flex items-center">
        <p className="text-title-3 py-padding-y-xs mr-auto">{title}</p>
        {info}
        {Icon && (
          <button>
            <Icon />
          </button>
        )}
      </div>
      {children}
    </li>
  );
}

type SectionItemProps = {
  title: string;
  rightElement?: React.ReactNode;
  onClick?: () => void;
};

function SectionItem({ title, rightElement, onClick }: SectionItemProps) {
  return (
    <div
      onClick={onClick}
      className="py-padding-y-xs flex justify-between items-center cursor-pointer"
    >
      <p className=" text-caption-l">{title}</p>
      {rightElement}
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="border-b border-interactive-border-default my-gap-y-s" />
  );
}
