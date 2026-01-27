import { createFileRoute } from "@tanstack/react-router";
import { SubHeader } from "@/components/Headers";
import SearchBar from "@/components/SearchBar";
import Modal from "@/components/Modal";
import { CloseFilledIcon, WarningFilledIcon } from "@/components/Icons";
import { Fragment, useEffect, useState } from "react";
import FriendItem, { FriendItemSkeleton } from "@/features/social/FriendItem";
import InlineButton from "@/components/InlineButton";
import { friendSearchHistoryOptions } from "@/features/social/queries";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "use-debounce";
import { api } from "@/lib/axios";
import { useAddFriendHistoryMutation } from "@/features/social/hooks/useAddFriendHistoryMutation";
import { useDeleteFriendHistoriesMutation } from "@/features/social/hooks/useDeleteFriendHistoriesMutation";
import { useDeleteFriendHistoryMutation } from "@/features/social/hooks/useDeleteFriendHistoryMutation";
import type { components } from "@/generated/api-types";
import type { ApiResponse } from "@/generated/api";

type AnswersReq = components["schemas"]["SearchUserRequest"];
type AnswersRes = components["schemas"]["SearchUserListResponse"];

export const Route = createFileRoute("/_authenticated/social/search")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(friendSearchHistoryOptions);
  },
});

function RouteComponent() {
  const { data: searchHistories } = useSuspenseQuery(
    friendSearchHistoryOptions,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(
    searchTerm,
    searchTerm === "" ? 0 : 300,
  );

  const isSearching = debouncedSearchTerm.trim().length > 0;
  const { ref, inView } = useInView();
  const addHistoryMutation = useAddFriendHistoryMutation();
  const deleteHistoriesMutation = useDeleteFriendHistoriesMutation();
  const deleteHistoryMutation = useDeleteFriendHistoryMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    data: searchResults,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["currentUser", "friends", "searchResults", debouncedSearchTerm],
    queryFn: async ({ pageParam }) => {
      const req: AnswersReq = {
        keyword: debouncedSearchTerm,
        cursor: pageParam || undefined,
      };
      const res = await api.get<ApiResponse<AnswersRes>>(
        "/api/v1/friends/search",
        {
          params: req,
        },
      );

      return res.data.data!;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : null,
    enabled: isSearching,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 친구 요청이 하나라도 있는가?
  const hasPendingRequests = searchResults?.pages.some(
    (page) => (page.pendingRequests?.length ?? 0) > 0,
  );

  return (
    <>
      <SubHeader variant="search">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isSearching) {
              addHistoryMutation.mutate({ nickname: searchTerm });
            }
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

      {isSearching ? (
        // 검색 결과 섹션
        <>
          {/* 나에게 친구 요청한 유저 중 검색어와 일치하는 유저 */}
          {hasPendingRequests && (
            <div className="border-b border-b-interactive-border-default px-padding-x-m py-padding-y-s">
              <span className="text-caption-m">친구 요청</span>
              <ul className="pt-padding-y-m flex flex-col gap-margin-y-xl">
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
                      </Fragment>
                    );
                  })}
                </>
              </ul>
            </div>
          )}
          {/* 전체 사용자 검색결과 */}
          <div className="px-padding-x-m py-padding-y-s">
            <span className="text-caption-m">사용자</span>
            <ul className="py-padding-y-m flex flex-col gap-margin-y-xl">
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
                          return (
                            <FriendItem
                              key={result.nickname}
                              name={result.nickname!}
                              profileImgUrl={result.profileImageUrl!}
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
                      </Fragment>
                    );
                  })}
                </>
              )}
            </ul>
          </div>
        </>
      ) : (
        // 최근 검색어 섹션
        <div className="px-padding-x-m py-padding-y-s">
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
            {searchHistories?.histories?.map((history) => {
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
        </div>
      )}
      <div ref={ref} />
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
