// 게시글 및 댓글 좋아요 목록
import type { components } from "@/generated/api-types";
import FriendItem from "./FriendItem";
import useBottomModalStore from "@/store/bottomModalStore";
import useModalStore from "@/store/modalStore";
import {
  MoreHorizontalIcon,
  UserCheckFilledIcon,
  WarningFilledIcon,
} from "@/components/Icons";
import { useBlockFriendMutation } from "./hooks/useBlockFriendMutation";
import { useDeleteFriendMutation } from "./hooks/useDeleteFriendMutation";
import useToastStore from "@/store/toastStore";
import { useFriendRequestMutation } from "./hooks/useFriendRequestMutation";
import InlineButton from "@/components/InlineButton";
import { useAcceptFriendRequestMutation } from "./hooks/useAcceptFriendMutation";
import { useRejectFriendRequestMutation } from "./hooks/useRejectFriendRequestMutation";
import { useDeleteFriendRequestMutation } from "./hooks/useDeleteFriendRequestMutation";
import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { currentUserOptions } from "../user/queries";
import type { CurrentUser } from "@/types/currentUser";
import { useEffect } from "react";
import type { AxiosError } from "axios";
import type { ApiErrResponse } from "@/generated/api";
import { useRouter } from "@tanstack/react-router";

type Liker = components["schemas"]["LikerResponse"];
type LikeRes = components["schemas"]["LikeListResponse"];

type ListProps = {
  queryOptions: UseQueryOptions<LikeRes, Error, LikeRes, any>;
};

export function LikeUserList({ queryOptions }: ListProps) {
  const queryClient = useQueryClient();
  const { data: likersData, error: likersError } = useQuery(queryOptions);
  const { data: currentUser } = useQuery(currentUserOptions);

  const router = useRouter();
  const { showModal, closeModal } = useModalStore();

  useEffect(() => {
    if (likersError) {
      const err = likersError as AxiosError<ApiErrResponse<null>>;
      const status = err.response?.status;
      const message =
        status === 404
          ? "존재하지 않는 게시글이에요."
          : "좋아요 열람 권한이 없어요.";

      showModal({
        icon: WarningFilledIcon,
        title: message,
        buttons: [
          {
            label: "확인",
            onClick: () => {
              closeModal();
              router.history.back();
            },
          },
        ],
      });
    }
  }, [likersError, showModal, closeModal, router.history]);

  return (
    <ul className="flex flex-col gap-margin-y-l">
      {likersData?.likers?.map((liker) => (
        <LikeUserListItem
          currentUser={currentUser!}
          key={liker.userId}
          liker={liker}
          onActionSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: queryOptions.queryKey,
            });
          }}
        />
      ))}
    </ul>
  );
}

type ItemProps = {
  currentUser: CurrentUser; // self 를 none으로 보내는 버그 때문에 추가
  liker: Liker;
  onActionSuccess?: () => void; // 친구 관련 액션 성공 후
};

export function LikeUserListItem({
  currentUser,
  liker,
  onActionSuccess,
}: ItemProps) {
  const { showModal, closeModal } = useModalStore();
  const { showBottomModal, closeBottomModal } = useBottomModalStore();
  const { showToast } = useToastStore();

  const friendRequestMutation = useFriendRequestMutation({
    onSuccess: () => {
      onActionSuccess?.();
      showToast({ message: "친구 신청 알림이 전송되었어요." });
    },
  });

  const acceptFriendRequestMutation = useAcceptFriendRequestMutation({
    onSuccess: () => onActionSuccess?.(),
  });
  const rejectFriendRequestMutation = useRejectFriendRequestMutation({
    onSuccess: () => onActionSuccess?.(),
  });
  const deleteFriendRequestMutation = useDeleteFriendRequestMutation({
    onSuccess: () => {
      onActionSuccess?.();
      showToast({ message: "친구 신청이 취소되었어요." });
    },
  });

  const blockFriendMutation = useBlockFriendMutation({
    onSuccess: () => {
      onActionSuccess?.();
      showToast({ message: "친구가 차단되었어요." });
    },
  });
  const deleteFriendMutation = useDeleteFriendMutation({
    onSuccess: () => {
      onActionSuccess?.();
      showToast({ message: "친구가 삭제되었어요." });
    },
  });

  const buttonConfig = {
    SELF: [],
    NONE: [
      <InlineButton
        key={"request button"}
        variant="secondary"
        isLoading={friendRequestMutation.isPending}
        onClick={() => {
          showModal({
            title: `${liker.nickname}님을 친구로 추가하겠어요?`,
            children: "친구 신청을 한 친구에게 즉시 알림이 전송돼요.",
            icon: UserCheckFilledIcon,
            buttons: [
              {
                label: "취소",
                onClick: closeModal,
              },
              {
                label: "확인",
                onClick: () => {
                  closeModal();
                  friendRequestMutation.mutate({
                    receiverNickname: liker.nickname!,
                  });
                },
              },
            ],
          });
        }}
      >
        친구 신청
      </InlineButton>,
    ],
    FRIEND: [
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
                    title: `${liker.nickname!}님을\n차단하겠어요?`,
                    children: "친구 차단 시 상호 간 친구 삭제가 이루어져요.",
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
                            blockedNickname: liker.nickname!,
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
                    title: `${liker.nickname!}님을\n친구에서 삭제하겠어요?`,
                    children: "친구 삭제 이후에 복구가 불가능해요.",
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
                            friendshipId: liker.friendshipId!,
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
    ],
    REQUEST_SENT: [
      <InlineButton
        variant="disabled"
        key={"delete request button"}
        isLoading={deleteFriendRequestMutation.isPending}
        onClick={() =>
          deleteFriendRequestMutation.mutate({
            friendshipId: liker.friendshipId!,
          })
        }
      >
        친구 신청 중
      </InlineButton>,
    ],
    REQUEST_RECEIVED: [
      <InlineButton
        key={1}
        variant="secondary"
        isLoading={rejectFriendRequestMutation.isPending}
        onClick={() => {
          rejectFriendRequestMutation.mutate({
            friendshipId: liker.friendshipId!,
          });
        }}
      >
        거절
      </InlineButton>,
      <InlineButton
        key={2}
        isLoading={acceptFriendRequestMutation.isPending}
        onClick={() => {
          acceptFriendRequestMutation.mutate({
            friendshipId: liker.friendshipId!,
          });
        }}
      >
        수락
      </InlineButton>,
    ],
  };

  return (
    <FriendItem
      key={liker.userId}
      name={liker.nickname!}
      profileImgUrl={liker.profileImageUrl!}
      buttons={
        liker.nickname === currentUser.nickname
          ? []
          : buttonConfig[liker.relationshipStatus!]
      }
    />
  );
}
