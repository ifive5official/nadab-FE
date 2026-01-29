import { createFileRoute } from "@tanstack/react-router";
import { SubHeader } from "@/components/Headers";
import SearchBar from "@/components/SearchBar";
import Modal from "@/components/Modal";
import type { Button } from "@/components/Modal";
import { useEffect, useState } from "react";
import { friendSearchHistoryOptions } from "@/features/social/queries";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "use-debounce";
import { api } from "@/lib/axios";
import { useAddFriendHistoryMutation } from "@/features/social/hooks/useAddFriendHistoryMutation";
import type { components } from "@/generated/api-types";
import type { ApiResponse } from "@/generated/api";
import FriendsTabRecentSearchSection from "@/features/social/FriendsTabRecentSearchSection";
import FriendsTabSearchResultSection from "@/features/social/FriendsTabSearchResultSection";
import { WarningFilledIcon } from "@/components/Icons";

type AnswersReq = components["schemas"]["SearchUserRequest"];
type AnswersRes = components["schemas"]["SearchUserListResponse"];

export type ModalConfig = {
  icon: React.ComponentType;
  title: string;
  children?: React.ReactNode;
  buttons: Button[];
};

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
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
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
        <FriendsTabSearchResultSection
          setModalConfig={setModalConfig}
          searchResults={searchResults}
          isFetching={isFetching}
        />
      ) : (
        <FriendsTabRecentSearchSection
          histories={searchHistories?.histories}
          onItemClick={(keyword: string) => setSearchTerm(keyword)}
        />
      )}
      <div ref={ref} />

      <Modal
        title={modalConfig?.title ?? ""}
        icon={modalConfig?.icon ?? WarningFilledIcon}
        isOpen={!!modalConfig}
        onClose={() => setModalConfig(null)}
        buttons={modalConfig?.buttons ?? []}
      >
        {modalConfig?.children}
      </Modal>
    </>
  );
}
