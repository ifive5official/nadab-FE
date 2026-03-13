import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import InlineButton from "@/components/InlineButton";
import NoResult from "@/components/NoResult";
import FriendItem from "@/features/social/FriendItem";
import { useUnBlockFriendMutation } from "@/features/social/hooks/useUnblockFriendMutation";
import { blockedFriendsOptions } from "@/features/social/queries";
import useToastStore from "@/store/toastStore";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/social/blocked")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(blockedFriendsOptions),
});

function RouteComponent() {
  const { data: blockedFriends } = useSuspenseQuery(blockedFriendsOptions);
  const { showToast } = useToastStore();
  // 대기 중 리스트 - pending 상태 관리 위해 사용
  const [unBlockingIds, setUnBlockingIds] = useState(new Set());

  const unBlockFriendMutation = useUnBlockFriendMutation({
    onSuccess: () => showToast({ message: "친구 차단이 해제되었어요." }),
    onSettled: (_data, _error, variables) => {
      setUnBlockingIds((prev) => {
        const next = new Set(prev);
        next.delete(variables.userBlockId);
        return next;
      });
    },
  });

  return (
    <>
      <SubHeader>차단된 친구</SubHeader>
      <Container>
        {(blockedFriends.totalCount ?? 0) ? (
          <ul className="pt-padding-y-m flex flex-col gap-margin-y-l">
            {blockedFriends.blockedUsers?.map((blockedUser) => {
              return (
                <FriendItem
                  key={blockedUser.userBlockId}
                  profileImgUrl={blockedUser.profileImageUrl!}
                  name={blockedUser.nickname!}
                  buttons={[
                    <InlineButton
                      key="button"
                      variant="secondary"
                      isLoading={unBlockingIds.has(blockedUser.userBlockId!)}
                      onClick={() => {
                        unBlockFriendMutation.mutate({
                          userBlockId: blockedUser.userBlockId!,
                        });
                        setUnBlockingIds((prev) =>
                          new Set(prev).add(blockedUser.userBlockId!),
                        );
                      }}
                    >
                      차단 해제
                    </InlineButton>,
                  ]}
                />
              );
            })}
          </ul>
        ) : (
          <NoResult
            title="차단된 친구가 없어요."
            description="차단된 친구가 있으면 여기에 표시돼요."
            className="my-auto pb-header-height"
          />
        )}
      </Container>
    </>
  );
}
