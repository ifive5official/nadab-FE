import { ChevronRightIcon } from "@/components/Icons";
import InlineButton from "@/components/InlineButton";
import SearchBar from "@/components/SearchBar";
import SegmentedControls from "@/components/SegmentedControls";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/_main/social")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selected, setSelected] = useState("feed");
  const [searchTerm, setSearchTerm] = useState("");
  const friends = Array(11).fill(0); // 임시
  return (
    <>
      <SegmentedControls
        options={[
          { label: "피드", value: "feed" },
          { label: "그룹", value: "group" },
          { label: "친구", value: "friend" },
        ]}
        selected={selected}
        onChange={setSelected}
        className="my-padding-y-m"
      />
      {/* 이하 친구 탭 내용 */}
      <SearchBar
        onChange={(e) => setSearchTerm(e.target.value)}
        value={searchTerm}
        onDeleteKeyword={() => setSearchTerm("")}
        className="h-11"
      />
      <div className="py-padding-y-m mt-margin-y-l mb-margin-y-m flex items-center border-y border-y-interactive-border-default">
        <div className="flex mr-margin-x-l">
          <div className="rounded-full aspect-square h-9 bg-neutral-300 -mt-4" />
          <div className="rounded-full aspect-square h-9 bg-neutral-300 -ml-5 -mb-4" />
        </div>
        <div className="flex flex-col mr-auto">
          <span className="text-label-m">친구 요청</span>
          <span className="text-caption-s text-text-tertiary">
            알케르닉스님 외 1명
          </span>
        </div>
        <div className="bg-brand-primary aspect-square m-[8.5px] h-[11px] rounded-full" />
        <button>
          <ChevronRightIcon size={28} />
        </button>
      </div>
      <span className="mt-margin-y-m text-caption-m">
        친구 {friends.length}명
      </span>
      <ul className="py-padding-y-m flex flex-col gap-gap-y-xl">
        {friends.map((_, i) => {
          return (
            <li key={i} className="flex items-center gap-margin-x-l">
              <div className="rounded-full aspect-square h-[50px] bg-neutral-300" />
              <span className="text-button-1 mr-auto">알케르닉스</span>
              <InlineButton size="m" variant="secondary">
                삭제
              </InlineButton>
            </li>
          );
        })}
      </ul>
    </>
  );
}
