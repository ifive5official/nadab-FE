import { createFileRoute, Link } from "@tanstack/react-router";
import { SubHeader } from "@/components/Headers";
import BlockButton from "@/components/BlockButton";
import initialCategories from "@/constants/categories";
import { useState } from "react";
import clsx from "clsx";
import { ChevronRightIcon } from "@/components/Icons";
import Switch from "@/components/Switch";
import { useLogoutMutation } from "@/features/auth/hooks/useLogoutMutation";

export const Route = createFileRoute("/_main/(account)/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentUser } = Route.useRouteContext();

  const categories = initialCategories.map((category) => ({
    ...category,
    isSelected: category.code === currentUser?.interestCode ? true : false,
  }));
  const [isNotificationOn, setIsNotificationOn] = useState(false);
  // Todo: 로컬스토리지에 저장
  const [isDarkMode, setIsDarkMode] = useState(false);

  const logoutMutation = useLogoutMutation();

  return (
    <div>
      <SubHeader>마이페이지</SubHeader>
      <div className="py-padding-y-m flex flex-col gap-gap-y-l">
        <div className="flex items-center gap-gap-x-l">
          <img
            src={currentUser?.profileImageUrl ?? "/default-profile.png"}
            className="rounded-full aspect-square h-[53px] object-cover"
          ></img>
          <div className="flex flex-col gap-y-xs">
            <p className="text-text-primary text-title-3">
              {currentUser?.nickname}
            </p>
            <p className="text-neutral-600 text-caption-l">
              {currentUser?.email}
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
          <Section title="관심 주제">
            <ul className="flex flex-wrap gap-gap-x-s py-padding-y-xs">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <li
                    key={category.title}
                    className={clsx(
                      "flex items-center gap-gap-x-xs text-label-m rounded-xl border border-button-tertiary-border-default px-2.5 py-[5px] bg-button-tertiary-bg-default cursor-pointer",
                      category.isSelected
                        ? "text-button-tertiary-text-default"
                        : "text-button-disabled-text"
                    )}
                  >
                    <Icon
                      fill={
                        category.isSelected
                          ? "var(--color-icon-primary)"
                          : "var(--color-icon-disabled)"
                      }
                    />
                    <p>{category.title}</p>
                  </li>
                );
              })}
            </ul>
          </Section>
          <SectionDivider />
          <Section title="알림 설정">
            <SectionItem
              title="알림"
              rightElement={
                <Switch
                  isOn={isNotificationOn}
                  onClick={() => setIsNotificationOn((prev) => !prev)}
                />
              }
            />
            <SectionItem
              title="알림 시간"
              rightElement={
                <div className="text-caption-m text-brand-primary border border-brand-primary rounded-full px-padding-x-xs py-padding-y-xxs">
                  08 : 00 AM
                </div>
              }
            />
          </Section>
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
  children?: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <li className="py-padding-y-xs px-padding-x-m">
      <div className="flex items-center">
        <p className="text-title-3 py-padding-y-xs mr-auto">{title}</p>
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
