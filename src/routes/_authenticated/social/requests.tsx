import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { createFileRoute } from "@tanstack/react-router";
import FriendItem from "@/features/social/FriendItem";
import { useState } from "react";
import { WarningFilledIcon } from "@/components/Icons";
import NoResult from "@/components/NoResult";
import InlineButton from "@/components/InlineButton";
import {
  friendRequestsOptions,
  friendsOptions,
} from "@/features/social/queries";
import { useQuery } from "@tanstack/react-query";
import { useAcceptFriendRequestMutation } from "@/features/social/hooks/useAcceptFriendMutation";
import { useRejectFriendRequestMutation } from "@/features/social/hooks/useRejectFriendRequestMutation";
import useErrorStore from "@/store/modalStore";
import useModalStore from "@/store/modalStore";
import useToastStore from "@/store/toastStore";

export const Route = createFileRoute("/_authenticated/social/requests")({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => [
    await Promise.all([
      queryClient.ensureQueryData(friendsOptions),
      queryClient.ensureQueryData(friendRequestsOptions),
    ]),
  ],
});

function RouteComponent() {
  const { data: friends } = useQuery(friendsOptions);
  const { data: friendRequests } = useQuery(friendRequestsOptions);
  const { showModal, closeModal } = useModalStore();
  const { showToast } = useToastStore();

  const acceptFriendRequestMutation = useAcceptFriendRequestMutation({
    onSuccess: () =>
      showToast({ message: "친구 요청이 수락되어 친구가 되었어요." }),
    onSettled: (_data, _error, variables) => {
      setAcceptingIds((prev) => {
        const next = new Set(prev);
        next.delete(variables.friendshipId);
        return next;
      });
    },
  });

  const rejectFriendRequestMutation = useRejectFriendRequestMutation({
    onSuccess: () => showToast({ message: "친구 요청이 거절되었어요." }),
    onSettled: (_data, _error, variables) => {
      setRejectingIds((prev) => {
        const next = new Set(prev);
        next.delete(variables.friendshipId);
        return next;
      });
    },
  });

  // 대기 중 리스트
  const [acceptingIds, setAcceptingIds] = useState(new Set());
  const [rejectingIds, setRejectingIds] = useState(new Set());

  const hasMaxFriends = (friends?.totalCount ?? 0) >= 20;

  return (
    <>
      <SubHeader>친구 요청</SubHeader>
      <Container>
        {(friendRequests?.totalCount ?? 0) > 0 ? (
          <ul className="pt-padding-y-m flex flex-col gap-margin-y-l">
            {friendRequests?.requests?.map((request) => {
              return (
                <FriendItem
                  key={request.friendshipId}
                  name={request.nickname!}
                  profileImgUrl={request.profileImageUrl!}
                  buttons={[
                    <InlineButton
                      key={1}
                      variant="secondary"
                      onClick={() => {
                        showModal({
                          title: `${request.nickname!}님의 요청을 거절할까요?`,
                          children: "친구 요청 거절 이후에 복구가 불가능해요.",
                          icon: WarningFilledIcon,
                          buttons: [
                            {
                              label: "취소",
                              onClick: closeModal,
                            },
                            {
                              label: "확인",
                              onClick: () => {
                                closeModal();
                                rejectFriendRequestMutation.mutate({
                                  friendshipId: request.friendshipId!,
                                });
                              },
                            },
                          ],
                        });
                      }}
                      isLoading={rejectingIds.has(request.friendshipId)}
                    >
                      거절
                    </InlineButton>,
                    <InlineButton
                      key={2}
                      variant={hasMaxFriends ? "disabled" : "primary"}
                      onClick={() => {
                        if (hasMaxFriends) {
                          useErrorStore
                            .getState()
                            .showError(
                              `친구는 최대 20명까지\n추가할 수 있어요.`,
                            );
                        } else {
                          acceptFriendRequestMutation.mutate({
                            friendshipId: request.friendshipId!,
                          });
                          setAcceptingIds((prev) =>
                            new Set(prev).add(request.friendshipId),
                          );
                        }
                      }}
                      isLoading={acceptingIds.has(request.friendshipId)}
                    >
                      수락
                    </InlineButton>,
                  ]}
                />
              );
            })}
          </ul>
        ) : (
          <NoResult
            title={`모든 친구 요청을\n수락했어요.`}
            description="검색을 통해 친구를 추가하고 기록을 나눠보세요."
            className="my-auto pb-header-height"
          />
        )}
      </Container>
    </>
  );
}
