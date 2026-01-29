import InlineButton from "@/components/InlineButton";
import FriendItem from "./FriendItem";
import { FriendItemSkeleton } from "./FriendItem";
import { Fragment } from "react";
import type { InfiniteData } from "@tanstack/react-query";
import type { components } from "@/generated/api-types";
import NoResult from "@/components/NoResult";
import { useFriendRequestMutation } from "./hooks/useFriendRequestMutation";
import { useDeleteFriendRequestMutation } from "./hooks/useDeleteFriendRequestMutation";
import { useDeleteFriendMutation } from "./hooks/useDeleteFriendMutation";
import type { ModalConfig } from "@/routes/_authenticated/social/search";
import { UserCheckFilledIcon, WarningFilledIcon } from "@/components/Icons";
import { useAcceptFriendRequestMutation } from "./hooks/useAcceptFriendMutation";
import { useRejectFriendRequestMutation } from "./hooks/useRejectFriendRequestMutation";

type AnswersRes = components["schemas"]["SearchUserListResponse"];

type Props = {
  setModalConfig: (config: ModalConfig | null) => void;
  searchResults: InfiniteData<AnswersRes> | undefined;
  isFetching: boolean;
};

type RelationshipStatus =
  | "SELF"
  | "NONE"
  | "FRIEND"
  | "REQUEST_SENT"
  | "REQUEST_RECEIVED";

type RequestBtnConfig = {
  label: string;
  onClick?: ({ nickname, id }: { nickname: string; id: number }) => void;
};

export default function FriendsTabSearchResultSection({
  setModalConfig,
  searchResults,
  isFetching,
}: Props) {
  // 유저 검색 결과가 하나라도 있는가?
  const hasResult = searchResults?.pages.some(
    (page) => (page.searchResults?.length ?? 0) > 0,
  );
  // 친구 요청이 하나라도 있는가?
  const hasPendingRequests = searchResults?.pages.some(
    (page) => (page.pendingRequests?.length ?? 0) > 0,
  );

  const acceptFriendRequestMutation = useAcceptFriendRequestMutation();
  const rejectFriendRequestMutation = useRejectFriendRequestMutation();

  const deleteFriendMutation = useDeleteFriendMutation({
    onSuccess: () => {
      setModalConfig(null);
    },
  });
  const friendRequestMutation = useFriendRequestMutation({
    onSuccess: () => {
      setModalConfig(null);
    },
  });
  const deleteFriendRequestMutation = useDeleteFriendRequestMutation();

  const REQUESTBTN_CONFIG: Record<RelationshipStatus, RequestBtnConfig | null> =
    {
      SELF: null, // 나일 땐 버튼 없음
      NONE: {
        label: "친구 신청",
        onClick: ({ nickname }) => {
          setModalConfig({
            title: `${nickname}님을 친구로 추가하겠어요?`,
            children: "친구 신청을 한 친구에게 즉시 알림이 전송돼요.",
            icon: UserCheckFilledIcon,
            buttons: [
              {
                label: "취소",
                onClick: () => setModalConfig(null),
              },
              {
                label: "확인",
                onClick: () =>
                  friendRequestMutation.mutate({
                    receiverNickname: nickname,
                  }),
              },
            ],
          });
        },
      },
      FRIEND: {
        label: "친구 삭제",
        onClick: ({ nickname, id }) => {
          setModalConfig({
            title: `${nickname}님을\n친구에서 삭제하겠어요?`,
            children: "친구 삭제 이후에 복구가 불가능해요.",
            icon: WarningFilledIcon,
            buttons: [
              {
                label: "취소",
                onClick: () => setModalConfig(null),
              },
              {
                label: "확인",
                onClick: () =>
                  deleteFriendMutation.mutate({ friendshipId: id }),
              },
            ],
          });
        },
      },
      REQUEST_SENT: {
        label: "친구 신청 중",
        onClick: ({ id }) => {
          deleteFriendRequestMutation.mutate({ friendshipId: id });
        },
      },
      // 이상하다 응답이 왜 이걸로 오냐
      // Todo: 임시 땜빵 고치자...
      REQUEST_RECEIVED: {
        label: "친구 신청 중",
        onClick: ({ id }) => {
          deleteFriendRequestMutation.mutate({ friendshipId: id });
        },
      },
    };

  return (
    <section className="flex-1 flex flex-col">
      {/* 검색 결과가 아무것도 없다면 */}
      {!hasResult && !hasPendingRequests && !isFetching && (
        <NoResult
          title={`검색어를 포함하는\n닉네임을 찾을 수 없어요.`}
          description="다른 검색어로 다시 찾아보세요."
          className="mx-auto my-auto pb-header-height"
        />
      )}
      {/* 나에게 친구 요청한 유저 중 검색어와 일치하는 유저 */}
      {hasPendingRequests && (
        <div className="w-full border-b border-b-interactive-border-default px-padding-x-m py-padding-y-s">
          <span className="text-caption-m">친구 요청</span>
          <ul className="w-full pt-padding-y-m flex flex-col gap-margin-y-xl">
            <>
              {searchResults?.pages.map((page, i) => {
                return (
                  <Fragment key={i}>
                    {page?.pendingRequests?.map((request) => {
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
                                rejectFriendRequestMutation.mutate({
                                  friendshipId: request.friendshipId!,
                                });
                              }}
                              isLoading={rejectFriendRequestMutation.isPending}
                            >
                              거절
                            </InlineButton>,
                            <InlineButton
                              key={2}
                              onClick={() => {
                                acceptFriendRequestMutation.mutate({
                                  friendshipId: request.friendshipId!,
                                });
                              }}
                              isLoading={acceptFriendRequestMutation.isPending}
                            >
                              수락
                            </InlineButton>,
                          ]}
                        />
                      );
                    })}
                  </Fragment>
                );
              })}
            </>
          </ul>
        </div>
      )}
      {/* 전체 사용자 검색결과 */}
      {hasResult && (
        <div className="w-full px-padding-x-m py-padding-y-s">
          <span className="text-caption-m">사용자</span>
          <ul className="w-full py-padding-y-m flex flex-col gap-margin-y-xl">
            {isFetching ? (
              <>
                {Array(7)
                  .fill(0)
                  .map((_, i) => (
                    <FriendItemSkeleton key={i} />
                  ))}
              </>
            ) : (
              <>
                {searchResults?.pages.map((page, i) => {
                  return (
                    <Fragment key={i}>
                      {page?.searchResults?.map((result) => {
                        const btnConfig =
                          REQUESTBTN_CONFIG[result.relationshipStatus!];
                        // 누른 버튼인지 확인
                        const isLoading =
                          (friendRequestMutation.isPending &&
                            friendRequestMutation.variables
                              ?.receiverNickname === result.nickname) ||
                          (deleteFriendMutation.isPending &&
                            deleteFriendMutation.variables?.friendshipId ===
                              result.friendshipId) ||
                          (deleteFriendRequestMutation.isPending &&
                            deleteFriendRequestMutation.variables
                              ?.friendshipId === result.friendshipId);
                        return (
                          <FriendItem
                            key={result.nickname}
                            name={result.nickname!}
                            profileImgUrl={result.profileImageUrl!}
                            buttons={[
                              btnConfig && (
                                <InlineButton
                                  key="action"
                                  variant="secondary"
                                  isLoading={isLoading}
                                  onClick={() => {
                                    btnConfig.onClick?.({
                                      nickname: result.nickname!,
                                      id: result.friendshipId ?? 0,
                                    });
                                  }}
                                >
                                  {btnConfig.label}
                                </InlineButton>
                              ),
                            ]}
                          />
                        );
                      })}
                    </Fragment>
                  );
                })}
              </>
            )}
          </ul>
        </div>
      )}
    </section>
  );
}
