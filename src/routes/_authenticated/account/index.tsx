import { createFileRoute } from "@tanstack/react-router";
import { SubHeader } from "@/components/Headers";
import { useUpdateInterestMutation } from "@/features/user/hooks/useUpdateInterestMutation";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SectionDivider } from "@/features/user/components/AccountSectionComponents";
import InterestSection from "@/features/user/components/InterestSection";
import NotificationSection from "@/features/user/components/NotificationSection";
import ThemeSection from "@/features/user/components/ThemeSection";
import useThemeStore from "@/store/useThemeStore";
import ProfileSection from "@/features/user/components/ProfileSection";
import { currentUserOptions } from "@/features/user/queries";
import AccountSection from "@/features/user/components/AccountSection";
import DeveloperSection from "@/features/user/components/DeveloperSection";
import Container from "@/components/Container";
import useToastStore from "@/store/toastStore";
import { notificationSettingsOptions } from "@/features/notifications/queries";
import { useChangeNotificationSettingsMutation } from "@/features/notifications/useChangeNotificationSettingsMutation";
import { Capacitor } from "@capacitor/core";
import { useRerollQuestionMutation } from "@/features/question/useRerollQuestionMutation";

export const Route = createFileRoute("/_authenticated/account/")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(notificationSettingsOptions),
});

function RouteComponent() {
  const { showToast } = useToastStore();

  const { data: currentUser } = useSuspenseQuery(currentUserOptions);
  const { data: notificationSettings } = useSuspenseQuery(
    notificationSettingsOptions,
  );
  const { isDarkMode, toggleTheme } = useThemeStore();

  const rerollQuestionMutation = useRerollQuestionMutation();
  const updateInterestMutation = useUpdateInterestMutation({
    onSuccess: () => {
      rerollQuestionMutation.mutate();
      showToast({ message: "선택 주제 변경이 완료되었어요." });
    },
  });

  const changeNotificationSettingsMutation =
    useChangeNotificationSettingsMutation({
      onSuccess: (message: string) => {
        if (message) {
          showToast({ message });
        }
      },
    });
  const shouldShowDeveloperSection =
    !import.meta.env.VITE_IS_PRODUCTION ||
    currentUser.email === "tester1@example.com";

  return (
    <>
      <SubHeader>마이페이지</SubHeader>
      <Container>
        <ProfileSection currentUser={currentUser} />

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
            {Capacitor.isNativePlatform() && (
              <>
                <NotificationSection
                  notificationSettings={notificationSettings}
                  onChange={changeNotificationSettingsMutation.mutate}
                />
                <SectionDivider />
              </>
            )}
            <ThemeSection isDarkMode={isDarkMode} onToggle={toggleTheme} />
            <SectionDivider />
            <AccountSection />
            {shouldShowDeveloperSection && (
              <>
                <SectionDivider />
                <DeveloperSection />
              </>
            )}
          </ul>
        </div>
      </Container>
    </>
  );
}
