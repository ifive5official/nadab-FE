import SegmentedControls, { type Option } from "@/components/SegmentedControls";
import FriendsTab from "@/features/social/FriendsTab";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import FeedTab from "@/features/social/FeedTab";
import {
  feedOptions,
  feedShareStatusOptions,
  friendRequestsOptions,
  friendsOptions,
} from "@/features/social/queries";
import Loading from "@/components/Loading";
import { useQuery } from "@tanstack/react-query";
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
        await Promise.all([
          queryClient.ensureQueryData(feedOptions),
          queryClient.ensureQueryData(friendsOptions),
          queryClient.ensureQueryData(feedShareStatusOptions),
        ]);
        break;
      case "group":
        break;
      case "friends":
        await Promise.all([
          queryClient.ensureQueryData(friendRequestsOptions),
          queryClient.ensureQueryData(friendsOptions),
        ]);
        break;
    }
  },
  pendingComponent: () => <Loading />,
  pendingMs: 200, // 0.2초 이상 걸릴 때만 로딩 컴포넌트 표시
  pendingMinMs: 200,
});

function RouteComponent() {
  const tab = Route.useSearch().tab ?? "feed";
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: friendRequests } = useQuery(friendRequestsOptions);

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

  return (
    <>
      <SegmentedControls
        options={tabs}
        selected={tab}
        onChange={handleTabChange}
        className="my-padding-y-m mx-padding-x-m"
      />
      {tab === "feed" && <FeedTab />}
      {/* {tab === "group" && <GroupTab />} */}
      {tab === "friends" && <FriendsTab />}
    </>
  );
}
