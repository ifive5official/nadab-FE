import Container from "@/components/Container";
import { MoreHorizontalIcon, WarningFilledIcon } from "@/components/Icons";
import SearchBar from "@/components/SearchBar";
import clsx from "clsx";
import FriendItem from "./FriendItem";
import { Link } from "@tanstack/react-router";
import NoResult from "@/components/NoResult";
import { useSuspenseQueries } from "@tanstack/react-query";
import {
  blockedFriendsOptions,
  friendRequestsOptions,
  friendsOptions,
} from "./queries";
import { useDeleteFriendMutation } from "./hooks/useDeleteFriendMutation";
import useModalStore from "@/store/modalStore";
import useToastStore from "@/store/toastStore";
import useBottomModalStore from "@/store/bottomModalStore";
import { useBlockFriendMutation } from "./hooks/useBlockFriendMutation";
import FriendManagementItem from "./FriendManagementItem";

export default function FriendsTab() {
  const [
    { data: friends },
    { data: friendRequests },
    { data: blockedFriends },
  ] = useSuspenseQueries({
    queries: [friendsOptions, friendRequestsOptions, blockedFriendsOptions],
  });
  const friendsCount = friends?.totalCount ?? 0;
  const requestsCount = friendRequests?.totalCount ?? 0;
  const blockedCount = blockedFriends?.totalCount ?? 0;

  const blockFriendMutation = useBlockFriendMutation({
    onSuccess: () => showToast({ message: "친구가 차단되었어요." }),
  });
  const deleteFriendMutation = useDeleteFriendMutation({
    onSuccess: () => showToast({ message: "친구가 삭제되었어요." }),
  });

  const { showBottomModal, closeBottomModal } = useBottomModalStore();
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
        {/* 친구 관리 섹션 */}
        {(requestsCount > 0 || blockedCount > 0) && (
          <div className="px-padding-x-m border-y border-y-interactive-border-default">
            <span className="text-caption-m mt-margin-y-m inline-block">
              친구 관리
            </span>
            {requestsCount > 0 && (
              <FriendManagementItem
                to="/social/requests"
                title="친구 요청"
                profileImgUrl={
                  friendRequests?.requests?.map(
                    (request) => request.profileImageUrl!,
                  ) ?? []
                }
                shownNickname={friendRequests?.requests![0].nickname ?? ""}
                totalCount={requestsCount}
                hasNotification={true} // 보이면 알림 있는 걸로 처리
              />
            )}
            {blockedCount > 0 && (
              <FriendManagementItem
                to="/social/blocked"
                title="차단된 친구"
                profileImgUrl={["/blocked.png"]}
                shownNickname={blockedFriends?.blockedUsers![0].nickname ?? ""}
                totalCount={blockedCount}
                hasNotification={false}
              />
            )}
          </div>
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
                      <button
                        key={"button"}
                        onClick={() =>
                          showBottomModal({
                            title: "친구 편집",
                            items: [
                              {
                                label: "차단",
                                type: "warning",
                                onClick: () => {
                                  showModal({
                                    icon: WarningFilledIcon,
                                    title: `${friend.nickname!}님을\n차단하겠어요?`,
                                    children:
                                      "친구 차단 시 상호 간 친구 삭제가 이루어져요.",
                                    buttons: [
                                      {
                                        label: "취소",
                                        onClick: closeModal,
                                      },
                                      {
                                        label: "확인",
                                        onClick: () => {
                                          closeModal();
                                          closeBottomModal();
                                          blockFriendMutation.mutate({
                                            blockedNickname: friend.nickname!,
                                          });
                                        },
                                      },
                                    ],
                                  });
                                },
                              },
                              {
                                label: "삭제",
                                type: "warning",
                                onClick: () => {
                                  showModal({
                                    icon: WarningFilledIcon,
                                    title: `${friend.nickname!}님을\n친구에서 삭제하겠어요?`,
                                    children:
                                      "친구 삭제 이후에 복구가 불가능해요.",
                                    buttons: [
                                      {
                                        label: "취소",
                                        onClick: closeModal,
                                      },
                                      {
                                        label: "확인",
                                        onClick: () => {
                                          closeModal();
                                          closeBottomModal();
                                          deleteFriendMutation.mutate({
                                            friendshipId: friend.friendshipId!,
                                          });
                                        },
                                      },
                                    ],
                                  });
                                },
                              },
                            ],
                          })
                        }
                      >
                        <MoreHorizontalIcon />
                      </button>,
                    ]}
                  />
                );
              })}
            </ul>
          ) : (
            <NoResult
              className={clsx("my-auto pb-padding-y-l")}
              title="아직은 친구가 없어요."
              description="검색을 통해 친구를 추가하고 기록을 나눠보세요."
            />
          )}
        </Container>
      </>
    </>
  );
}
