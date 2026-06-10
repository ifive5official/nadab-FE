import SegmentedControls, { type Option } from "@/components/SegmentedControls";
import FriendsTab from "@/features/social/FriendsTab";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import FeedTab from "@/features/social/FeedTab";
import {
  blockedFriendsOptions,
  feedOptions,
  feedShareStatusOptions,
  friendRequestsOptions,
  friendsOptions,
  suspensionStatusOptions,
} from "@/features/social/queries";
import Loading from "@/components/Loading";
import { useQueries } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import useModalStore from "@/store/modalStore";
import { WarningFilledIcon } from "@/components/Icons";
import { formatKoreanDate } from "@/lib/formatters";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
// import GroupTab from "@/features/social/GroupTab";

type Tab = "feed" | "group" | "friends";

export const Route = createFileRoute("/_authenticated/_main/social")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => {
    return {
      tab: (search.tab as Tab) || "feed", // 기본값 feed
    };
  },
  loaderDeps: ({ search: { tab } }) => ({ tab }),
  loader: async ({ deps: { tab }, context: { queryClient } }) => {
    switch (tab) {
      case "feed":
        queryClient.ensureQueryData(feedOptions);
        queryClient.ensureQueryData(friendsOptions);
        queryClient.ensureQueryData(feedShareStatusOptions);

        break;
      case "group":
        break;
      case "friends":
        queryClient.ensureQueryData(friendRequestsOptions);
        queryClient.ensureQueryData(friendsOptions);
        queryClient.ensureQueryData(blockedFriendsOptions);

        break;
    }
  },
});

function RouteComponent() {
  const tab = Route.useSearch().tab ?? "feed";
  const navigate = useNavigate({ from: Route.fullPath });

  const [{ data: friendRequests }, { data: suspensionStatus }] = useQueries({
    queries: [friendRequestsOptions, suspensionStatusOptions],
  });
  const { showModal, closeModal } = useModalStore();

  const tabs: Option[] = [
    { label: "피드", value: "feed" },
    // { label: "그룹", value: "group" },
    {
      label: "친구",
      value: "friends",
      hasNotification: !!friendRequests?.totalCount,
    },
  ];

  function handleTabChange(value: string) {
    navigate({
      search: (prev) => ({ ...prev, tab: value as Tab }),
      replace: true,
    });
  }

  // 소셜 정지 상태일 때 모달 띄움
  useEffect(() => {
    if (suspensionStatus?.isSuspended) {
      showModal({
        icon: WarningFilledIcon,
        title: "소셜 기능 사용이 일시 중단되었어요.",
        children: `30일간 소셜 기능이 제한되었어요.
        중단 기간 동안 게시글은 자동 비공개 처리돼요.
        ${formatKoreanDate(new Date(suspensionStatus?.expiresAt ?? ""))}에 해제돼요.`,
        buttons: [
          {
            label: "확인",
            onClick: () => {
              navigate({ to: "/" });
              closeModal();
            },
          },
          {
            label: "문의하기",
            onClick: () => {
              closeModal();
              const url = "mailto:ifive5.official@gmail.com";
              if (Capacitor.isNativePlatform()) {
                Browser.open({ url });
              } else {
                window.location.href = url;
              }
            },
          },
        ],
      });
    }
  }, [suspensionStatus, closeModal, showModal, navigate]);

  return (
    <>
      <SegmentedControls
        options={tabs}
        selected={tab}
        onChange={handleTabChange}
        className="my-padding-y-m mx-padding-x-m"
      />
      <Suspense fallback={<Loading />}>
        {tab === "feed" && <FeedTab />}
        {/* {tab === "group" && <GroupTab />} */}
        {tab === "friends" && <FriendsTab />}
      </Suspense>
      <AnimatePresence>
        <Outlet />
      </AnimatePresence>
    </>
  );
}
