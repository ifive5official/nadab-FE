import InlineButton from "@/components/InlineButton";
import FriendItem from "./FriendItem";
import { CloseFilledIcon } from "@/components/Icons";
import type { components } from "@/generated/api-types";
import { useDeleteFriendHistoriesMutation } from "./hooks/useDeleteFriendHistoriesMutation";
import { useDeleteFriendHistoryMutation } from "./hooks/useDeleteFriendHistoryMutation";

type Props = {
  histories: components["schemas"]["SearchHistoryResponse"][] | undefined;
};

export default function FriendsTabRecentSearchSection({ histories }: Props) {
  const deleteHistoriesMutation = useDeleteFriendHistoriesMutation();
  const deleteHistoryMutation = useDeleteFriendHistoryMutation();

  return (
    <section className="px-padding-x-m py-padding-y-s">
      <div className="flex justify-between items-center">
        <span className="text-label-l">최근 검색어</span>
        <InlineButton
          variant="tertiary"
          size="s"
          onClick={() => deleteHistoriesMutation.mutate()}
        >
          전체 삭제
        </InlineButton>
      </div>
      <ul className="flex flex-col py-padding-y-m gap-margin-y-xl">
        {histories?.map((history) => {
          return (
            <FriendItem
              key={history.nickname}
              name={history.nickname!}
              profileImgUrl={history.profileImageUrl!}
              buttons={[
                <button
                  key={1}
                  onClick={() => {
                    deleteHistoryMutation.mutate({
                      nickname: history.nickname!,
                    });
                  }}
                >
                  <CloseFilledIcon />
                </button>,
              ]}
            />
          );
        })}
      </ul>
    </section>
  );
}
