import Container from "@/components/Container";
import { ChevronRightIcon, WarningFilledIcon } from "@/components/Icons";
import SearchBar from "@/components/SearchBar";
import { useState } from "react";
import { NoResultIcon } from "@/components/Icons";
import clsx from "clsx";
import Modal from "@/components/Modal";
import FriendItem from "./FriendItem";
import { Link } from "@tanstack/react-router";

export default function FriendsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const friends = Array(11).fill(0); // 임시
  const friendRequests = Array(3).fill(0); // 임시
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <SearchBar
        onChange={(e) => setSearchTerm(e.target.value)}
        value={searchTerm}
        onDeleteKeyword={() => setSearchTerm("")}
        className="h-11 mx-padding-x-m shrink-0"
      />
      {/* 친구 요청 미리보기 섹션 */}
      {friendRequests.length > 0 && (
        <Link to="/social/requests">
          <div className="px-padding-x-m py-padding-y-m mt-margin-y-l flex items-center border-y border-y-interactive-border-default">
            <div className="flex mr-margin-x-l">
              <div
                className={clsx(
                  "rounded-full aspect-square h-9 bg-neutral-300",
                  friendRequests.length >= 2 && "-mt-4",
                )}
              />
              {friendRequests.length === 2 && (
                <div className="rounded-full aspect-square h-9 bg-neutral-300 -ml-5 -mb-4" />
              )}
              {friendRequests.length > 2 && (
                <div className="rounded-full aspect-square h-9 -ml-5 -mb-4 flex items-center justify-center text-label-s bg-button-primary-bg-default border border-interactive-border-default dark:border-0 text-text-inverse-primary">
                  +{friendRequests.length - 1}
                </div>
              )}
            </div>
            <div className="flex flex-col mr-auto">
              <span className="text-label-m">친구 요청</span>
              <span className="text-caption-s text-text-tertiary">
                알케르닉스님{" "}
                {friendRequests.length > 1 &&
                  `외 ${friendRequests.length - 1}명`}
              </span>
            </div>
            <div className="bg-brand-primary aspect-square m-[8.5px] h-[11px] rounded-full" />
            <button>
              <ChevronRightIcon size={28} />
            </button>
          </div>
        </Link>
      )}
      {/* 친구 섹션 */}
      <Container hasHeader={false}>
        <span className="text-caption-m mt-margin-y-m">
          친구 {friends.length}명
        </span>
        {friends.length > 0 ? (
          <ul className="pt-padding-y-m flex flex-col gap-gap-y-xl">
            {friends.map((_, i) => {
              return (
                <FriendItem
                  key={i}
                  name="알케르닉스"
                  profileImgUrl=""
                  buttons={[
                    {
                      label: "삭제",
                      onClick: () => setIsModalOpen(false),
                    },
                  ]}
                />
              );
            })}
          </ul>
        ) : (
          <div
            className={clsx(
              "flex flex-col items-center gap-gap-y-l mb-auto",
              friendRequests.length === 0
                ? "mt-[calc((110/796)*100dvh)]"
                : "mt-[calc((70/796)*100dvh)]",
            )}
          >
            <NoResultIcon className="p-3.5" />
            <p className="text-title-1">아직은 친구가 없어요.</p>
            <p className="text-caption-m">
              검색을 통해 친구를 추가하고 기록을 나눠보세요.
            </p>
          </div>
        )}
      </Container>
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
