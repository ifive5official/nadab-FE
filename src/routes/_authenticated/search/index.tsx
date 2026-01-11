import { EmotionBadge, QuestionBadge } from "@/components/Badges";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { CloseFilledIcon } from "@/components/Icons";
import SearchBar from "@/components/SearchBar";
import categories from "@/constants/categories";
import emotions from "@/constants/emotions";
import {
  useInfiniteQuery,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";
import type { ApiResponse } from "@/generated/api";
import { searchHistoryOptions } from "@/features/search/queries";
import { useDeleteHistoryMutation } from "@/features/search/useDeleteHistoryMutation";
import { useDeleteHistoriesMutation } from "@/features/search/useDeleteHistoriesMutation";

type AnswersReq = components["schemas"]["SearchAnswerEntryRequest"];
type AnswersRes = components["schemas"]["SearchAnswerEntryResponse"];
type SearchItem = components["schemas"]["AnswerEntrySummaryResponse"];

export const Route = createFileRoute("/_authenticated/search/")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(searchHistoryOptions);
  },
});

function RouteComponent() {
  const { data: searchHistories } = useSuspenseQuery(searchHistoryOptions);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, { isPending }] = useDebounce(searchTerm, 500);
  const isDebouncing = isPending();
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();
  const deleteHistoriesMutation = useDeleteHistoriesMutation();
  const deleteHistoryMutation = useDeleteHistoryMutation();
  const {
    data: searchResults,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["currentUser", "searchResults", debouncedSearchTerm],
    queryFn: async ({ pageParam }) => {
      const req: AnswersReq = {
        keyword: debouncedSearchTerm || undefined,
        emotionCode: undefined,
        cursor: pageParam || undefined,
      };
      const res = await api.get<ApiResponse<AnswersRes>>("/api/v1/answers", {
        params: req,
      });
      // 검색 후 검색 히스토리 리셋
      if (debouncedSearchTerm.trim()) {
        queryClient.invalidateQueries({
          queryKey: ["currentUser", "searchKeywords"],
        });
      }
      return res.data.data!;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : null,
    enabled: debouncedSearchTerm.trim().length > 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      <SubHeader variant="search">
        <SearchBar
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          onDelete={() => setSearchTerm("")}
          className="mr-margin-x-l"
        />
      </SubHeader>
      <Container>
        {debouncedSearchTerm ? (
          <div className="my-margin-y-l">
            {isFetching || isDebouncing ? (
              <ul className="list-none flex flex-col gap-gap-y-l">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <SearchResultSkeleton key={i} />
                  ))}
              </ul>
            ) : (
              <>
                {searchResults?.pages.map((page, i) => {
                  return (
                    <ul key={i} className="list-none flex flex-col gap-gap-y-l">
                      {page.items?.map((item) => {
                        return (
                          <SearchResultItem item={item} key={item.answerId} />
                        );
                      })}
                    </ul>
                  );
                })}
              </>
            )}
          </div>
        ) : (
          <div className="my-margin-y-m flex flex-col gap-margin-y-xl">
            {(searchHistories.histories?.length ?? 0) > 0 && (
              <KeywordSection
                header={
                  <>
                    <span>최근 검색어</span>
                    <button
                      onClick={() => deleteHistoriesMutation.mutate()}
                      className="bg-button-tertiary-bg-default border border-button-tertiary-border-default rounded-full text-button-2 px-padding-x-xs py-[calc(var(--spacing-padding-y-xxs)+2px)]"
                    >
                      전체 삭제
                    </button>
                  </>
                }
              >
                <div className="flex flex-wrap gap-1.5">
                  {searchHistories.histories?.map((item) => {
                    return (
                      <button
                        key={item.id}
                        onClick={() =>
                          deleteHistoryMutation.mutate({ historyId: item.id! })
                        }
                        className="flex gap-gap-x-xs bg-button-tertiary-bg-default border border-button-tertiary-border-default rounded-full text-button-2 px-padding-x-m py-padding-y-xs"
                      >
                        <span>{item.keyword}</span>
                        <CloseFilledIcon />
                      </button>
                    );
                  })}
                </div>
              </KeywordSection>
            )}

            <KeywordSection header={<span>기록의 색상으로 검색하기</span>}>
              <div className="grid grid-cols-3 gap-1.5">
                {emotions.map((emotion) => {
                  return (
                    <button key={emotion.code}>
                      <EmotionBadge
                        emotion={emotion.code}
                        variant="big"
                        filled
                      />
                    </button>
                  );
                })}
              </div>
            </KeywordSection>
          </div>
        )}
        <div ref={ref} />
      </Container>
    </>
  );
}

type KeywordSectionProps = {
  header: React.ReactNode;
  children: React.ReactNode;
};

function KeywordSection({ header, children }: KeywordSectionProps) {
  return (
    <section className="flex flex-col gap-y-margin-y-m">
      <div className="flex justify-between items-center text-label-l">
        {header}
      </div>
      {children}
    </section>
  );
}

function SearchResultSkeleton() {
  return (
    <li className="px-padding-x-m py-padding-y-m rounded-lg bg-surface-layer-2 animate-pulse">
      <div className="invisible">
        <div className="flex gap-padding-x-xxs">
          <QuestionBadge category={"PREFERENCE"} />
          <EmotionBadge emotion={"JOY"} />
          <span className="text-caption-s text-text-tertiary ml-auto">
            test
          </span>
        </div>
        <p className="text-label-l">test</p>
        <p className="text-caption-m text-text-secondary">test</p>
      </div>
    </li>
  );
}

function SearchResultItem({ item }: { item: SearchItem }) {
  return (
    <li className="px-padding-x-m py-padding-y-m bg-surface-base border border-border-base rounded-lg">
      <div className="flex gap-padding-x-xxs">
        <QuestionBadge
          category={item.interestCode as (typeof categories)[number]["code"]}
        />
        <EmotionBadge
          emotion={item.emotionCode as (typeof emotions)[number]["code"]}
        />
        <span className="text-caption-s text-text-tertiary ml-auto">
          {item.answerDate}
        </span>
      </div>
      <p className="text-label-l">{item.questionText}</p>
      <p className="text-caption-m text-text-secondary">
        {item.matchedSnippet}
      </p>
    </li>
  );
}
