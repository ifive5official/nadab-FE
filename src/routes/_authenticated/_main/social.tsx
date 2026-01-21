import SegmentedControls from "@/components/SegmentedControls";
import FriendsTab from "@/features/social/FriendsTab";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import FeedTab from "@/features/social/FeedTab";
import GroupTab from "@/features/social/GroupTab";

export const Route = createFileRoute("/_authenticated/_main/social")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selected, setSelected] = useState("feed");

  const tabs = [
    { label: "피드", value: "feed" },
    { label: "그룹", value: "group" },
    { label: "친구", value: "friend" },
  ];

  return (
    <>
      <SegmentedControls
        options={tabs}
        selected={selected}
        onChange={setSelected}
        className="my-padding-y-m mx-padding-x-m"
      />
      {selected === "feed" && <FeedTab />}
      {selected === "group" && <GroupTab />}
      {selected === "friend" && <FriendsTab />}
    </>
  );
}
