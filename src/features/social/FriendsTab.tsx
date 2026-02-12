import Container from "@/components/Container";
import { ChevronRightIcon, WarningFilledIcon } from "@/components/Icons";
import SearchBar from "@/components/SearchBar";
import clsx from "clsx";
import FriendItem from "./FriendItem";
import { Link } from "@tanstack/react-router";
import NoResult from "@/components/NoResult";
import InlineButton from "@/components/InlineButton";
import { useSuspenseQueries } from "@tanstack/react-query";
import { friendRequestsOptions, friendsOptions } from "./queries";
import ProfileImg from "@/components/ProfileImg";
import { useDeleteFriendMutation } from "./hooks/useDeleteFriendMutation";
import useModalStore from "@/store/modalStore";
import useToastStore from "@/store/toastStore";

export default function FriendsTab() {
  const [friendsQuery, requestsQuery] = useSuspenseQueries({
    queries: [friendsOptions, friendRequestsOptions],
  });
  const friends = friendsQuery.data;
  const friendsCount = friends?.totalCount ?? 0;
  const friendRequests = requestsQuery.data;
  const requestsCount = friendRequests?.totalCount ?? 0;

  const deleteFriendMutation = useDeleteFriendMutation({
    onSuccess: () => showToast({ message: "친구가 삭제되었어요." }),
  });

  const { showModal, closeModal } = useModalStore();
  const { showToast } = useToastStore();

  return (
    <>
      <Link to="/social/search">
        <div
          className={clsx(
            "pointer-events-none mx-padding-x-m shrink-0",
            requestsCount > 0 && "mb-margin-y-l",
          )}
        >
          {/* @ts-ignore */}
          <SearchBar
            className="h-11"
            placeholder="닉네임을 검색하여 친구를 추가해보세요."
          />
        </div>
      </Link>

      <>
        {/* 친구 요청 미리보기 섹션 */}
        {requestsCount > 0 && (
          <Link to="/social/requests">
            <div className="px-padding-x-m py-padding-y-m flex items-center border-y border-y-interactive-border-default">
              <div className="flex mr-margin-x-l">
                <ProfileImg
                  width={36}
                  src={friendRequests?.requests![0].profileImageUrl}
                  className={clsx(requestsCount >= 2 && "-mt-4")}
                />
                {requestsCount === 2 && (
                  <ProfileImg
                    width={36}
                    src={friendRequests?.requests![1].profileImageUrl}
                    className="-ml-5 -mb-4"
                  />
                )}
                {requestsCount > 2 && (
                  <div className="rounded-full aspect-square h-9 -ml-5 -mb-4 flex items-center justify-center text-label-s bg-button-primary-bg-default border border-interactive-border-default dark:border-0 text-text-inverse-primary">
                    +{requestsCount - 1}
                  </div>
                )}
              </div>
              <div className="flex flex-col mr-auto">
                <span className="text-label-m">친구 요청</span>
                <span className="text-caption-s text-text-tertiary">
                  {friendRequests?.requests![0].nickname}님{" "}
                  {requestsCount > 1 && `외 ${requestsCount - 1}명`}
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
        <Container isMain={true}>
          <span className="text-caption-m mt-margin-y-m">
            친구 {friendsCount}명
          </span>
          {friendsCount > 0 ? (
            <ul className="pt-padding-y-m flex flex-col gap-gap-y-xl">
              {friends?.friends?.map((friend) => {
                return (
                  <FriendItem
                    key={friend.friendshipId}
                    name={friend.nickname!}
                    profileImgUrl={friend.profileImageUrl!}
                    buttons={[
                      <InlineButton
                        key={1}
                        variant="secondary"
                        onClick={() => {
                          showModal({
                            icon: WarningFilledIcon,
                            title: `${friend.nickname!}님을 친구에서 삭제하겠어요?`,
                            children: " 친구 삭제 이후에 복구가 불가능해요.",
                            buttons: [
                              {
                                label: "취소",
                                onClick: closeModal,
                              },
                              {
                                label: "확인",
                                onClick: () => {
                                  closeModal();
                                  deleteFriendMutation.mutate({
                                    friendshipId: friend.friendshipId!,
                                  });
                                },
                              },
                            ],
                          });
                        }}
                        isLoading={deleteFriendMutation.isPending}
                      >
                        삭제
                      </InlineButton>,
                    ]}
                  />
                );
              })}
            </ul>
          ) : (
            <NoResult
              className={clsx(
                "mb-auto",
                friendsCount === 0
                  ? "mt-[calc((110/796)*100dvh)]"
                  : "mt-[calc((70/796)*100dvh)]",
              )}
              title="아직은 친구가 없어요."
              description="검색을 통해 친구를 추가하고 기록을 나눠보세요."
            />
          )}
        </Container>
      </>
    </>
  );
}
