import { createFileRoute, Link } from "@tanstack/react-router";
import { SubHeader } from "@/components/Headers";
import BlockButton from "@/components/BlockButton";
import { useState } from "react";
import { ChevronRightIcon } from "@/components/Icons";
import { useLogoutMutation } from "@/features/auth/hooks/useLogoutMutation";
import { useUpdateInterestMutation } from "@/features/user/hooks/useUpdateInterestMutation";
import Toast from "@/components/Toast";
import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  Section,
  SectionItem,
  SectionDivider,
} from "@/features/user/components/AccountSectionComponents";
import InterestSection from "@/features/user/components/InterestSection";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/generated/api";
import type { components } from "@/generated/api-types";
import NotificationSection from "@/features/user/components/NotificationSection";
import { useToggleNotificationMutation } from "@/features/user/hooks/useToggleNotificationMutation";
import ThemeSection from "@/features/user/components/ThemeSection";
import useThemeStore from "@/store/useThemeStore";

const notificationOptions = queryOptions({
  queryKey: ["notification"],
  queryFn: async () => {
    const res = await api.get<ApiResponse<NotificationRes>>(
      "/api/v1/terms/consent/marketing"
    );
    return res.data.data!.agreed!;
  },
});

export const Route = createFileRoute("/_main/(account)/account")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(notificationOptions),
});

type NotificationRes = components["schemas"]["MarketingConsentResponse"];

function RouteComponent() {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const context = Route.useRouteContext();
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    initialData: context.currentUser,
  });
  const { data: isNotificationon } = useSuspenseQuery(notificationOptions);
  const { isDarkMode, toggleTheme } = useThemeStore();

  const updateInterestMutation = useUpdateInterestMutation({
    onSuccess: () => {
      setToastMessage("관심 주제 변경이 완료되었습니다.");
      setIsToastOpen(true);
    },
  });
  const toggleNotificationMutation = useToggleNotificationMutation({
    onSuccess: (newSetting: boolean) => {
      if (newSetting) {
        setToastMessage("알림이 설정되었습니다.");
        setIsToastOpen(true);
      }
    },
  });
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
          <InterestSection
            currentUser={currentUser}
            onSelectInterest={(code) =>
              updateInterestMutation.mutate({ interestCode: code })
            }
            isPending={updateInterestMutation.isPending}
          />
          <SectionDivider />
          <NotificationSection
            isOn={isNotificationon ?? false}
            onToggle={(prev: boolean) =>
              toggleNotificationMutation.mutate({ agreed: !prev })
            }
          />
          <SectionDivider />
          <ThemeSection isDarkMode={isDarkMode} onToggle={toggleTheme} />
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
      <Toast
        isOpen={isToastOpen}
        message={toastMessage}
        onClose={() => setIsToastOpen(false)}
      />
    </div>
  );
}
