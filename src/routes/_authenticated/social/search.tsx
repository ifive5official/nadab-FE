import { createFileRoute } from "@tanstack/react-router";
import { SubHeader } from "@/components/Headers";
import SearchBar from "@/components/SearchBar";
import Modal from "@/components/Modal";
import { CloseFilledIcon, WarningFilledIcon } from "@/components/Icons";
import { useState } from "react";
import FriendItem from "@/features/social/FriendItem";
import InlineButton from "@/components/InlineButton";

export const Route = createFileRoute("/_authenticated/social/search")({
  component: RouteComponent,
});

function RouteComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <SubHeader variant="search">
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <SearchBar
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            onDeleteKeyword={() => setSearchTerm("")}
            className="mr-margin-x-l h-10"
          />
        </form>
      </SubHeader>
      <div className="mt-header-height h-gap-y-l border-b border-b-interactive-border-default" />

      {searchTerm ? (
        // 검색 결과 섹션
        <>
          <div className="border-b border-b-interactive-border-default px-padding-x-m py-padding-y-s">
            <span className="text-caption-m">친구 요청</span>
            <ul className="pt-padding-y-m flex flex-col gap-margin-y-xl">
              {Array(2)
                .fill(0)
                .map((_, i) => {
                  return (
                    <FriendItem
                      key={i}
                      name="알케르닉스"
                      profileImgUrl=""
                      buttons={[
                        <InlineButton
                          key={1}
                          variant="secondary"
                          onClick={() => setIsModalOpen(true)}
                        >
                          거절
                        </InlineButton>,
                        <InlineButton
                          key={2}
                          onClick={() => setIsModalOpen(true)}
                        >
                          수락
                        </InlineButton>,
                      ]}
                    />
                  );
                })}
            </ul>
          </div>
          <div className="px-padding-x-m py-padding-y-s">
            <span className="text-caption-m">사용자</span>
            <ul className="py-padding-y-m flex flex-col gap-margin-y-xl">
              {Array(5)
                .fill(0)
                .map((_, i) => {
                  return (
                    <FriendItem
                      key={i}
                      name="알케르닉스"
                      profileImgUrl=""
                      buttons={[
                        <InlineButton
                          key={1}
                          variant="secondary"
                          onClick={() => setIsModalOpen(true)}
                        >
                          친구 신청
                        </InlineButton>,
                      ]}
                    />
                  );
                })}
            </ul>
          </div>
        </>
      ) : (
        // 최근 검색어 섹션
        <div className="px-padding-x-m py-padding-y-s">
          <div className="flex justify-between items-center">
            <span className="text-label-l">최근 검색어</span>
            <InlineButton variant="tertiary" size="s">
              전체 삭제
            </InlineButton>
          </div>
          <ul className="flex flex-col py-padding-y-m gap-margin-y-xl">
            {Array(5)
              .fill(0)
              .map((_, i) => {
                return (
                  <FriendItem
                    key={i}
                    name="알케르닉스"
                    profileImgUrl=""
                    buttons={[
                      <button key={1}>
                        <CloseFilledIcon />
                      </button>,
                    ]}
                  />
                );
              })}
          </ul>
        </div>
      )}
      <Modal
        title={`알케르닉스님을 친구에서 삭제하겠어요?`}
        icon={WarningFilledIcon}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        buttons={[
          {
            label: "취소",
            onClick: () => setIsModalOpen(false),
          },
          {
            label: "확인",
            onClick: () => setIsModalOpen(false),
          },
        ]}
      >
        친구 삭제 이후에 복구가 불가능해요.
      </Modal>
    </>
  );
}
