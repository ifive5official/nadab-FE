import Container from "@/components/Container";
import { ChevronRightIcon } from "@/components/Icons";
import InlineButton from "@/components/InlineButton";
import SearchBar from "@/components/SearchBar";
import { useState } from "react";
import { NoResultIcon } from "@/components/Icons";

export default function FriendsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const friends = Array(0).fill(0); // 임시
  const friendRequests = Array(0).fill(0); // 임시

  return (
    <>
      <SearchBar
        onChange={(e) => setSearchTerm(e.target.value)}
        value={searchTerm}
        onDeleteKeyword={() => setSearchTerm("")}
        className="h-11 mx-padding-x-m"
      />
      {/* 친구 요청 미리보기 섹션 */}
      {friendRequests.length > 0 && (
        <div className="px-padding-x-m py-padding-y-m mt-margin-y-l flex items-center border-y border-y-interactive-border-default">
          <div className="flex mr-margin-x-l">
            <div className="rounded-full aspect-square h-9 bg-neutral-300 -mt-4" />
            <div className="rounded-full aspect-square h-9 bg-neutral-300 -ml-5 -mb-4" />
          </div>
          <div className="flex flex-col mr-auto">
            <span className="text-label-m">친구 요청</span>
            <span className="text-caption-s text-text-tertiary">
              알케르닉스님{" "}
              {friendRequests.length > 1 && `외 ${friendRequests.length - 1}명`}
            </span>
          </div>
          <div className="bg-brand-primary aspect-square m-[8.5px] h-[11px] rounded-full" />
          <button>
            <ChevronRightIcon size={28} />
          </button>
        </div>
      )}
      {/* 친구 섹션 */}
      <Container hasHeader={false}>
        <span className="text-caption-m mt-margin-y-m">
          친구 {friends.length}명
        </span>
        {friends.length > 0 ? (
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
        ) : (
          <div className="flex flex-col items-center gap-gap-y-l mt-[calc((110/796)*100dvh)] mb-auto">
            <NoResultIcon className="p-3.5" />
            <p className="text-title-1">아직은 친구가 없어요.</p>
            <p className="text-caption-m">
              검색을 통해 친구를 추가하고 기록을 나눠보세요.
            </p>
          </div>
        )}
      </Container>
    </>
  );
}
