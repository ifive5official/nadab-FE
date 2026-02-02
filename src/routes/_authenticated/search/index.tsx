import { EmotionBadge, QuestionBadge } from "@/components/Badges";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { CloseFilledIcon } from "@/components/Icons";
import SearchBar from "@/components/SearchBar";
import categories from "@/constants/categories";
import emotions from "@/constants/emotions";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";
import type { ApiResponse } from "@/generated/api";
import { searchHistoryOptions } from "@/features/search/queries";
import { useDeleteHistoryMutation } from "@/features/search/useDeleteHistoryMutation";
import { useDeleteHistoriesMutation } from "@/features/search/useDeleteHistoriesMutation";
import { useAddHistoryMutation } from "@/features/search/useAddHistoryMutation";
import NoResult from "@/components/NoResult";

type AnswersReq = components["schemas"]["SearchAnswerEntryRequest"];
type AnswersRes = components["schemas"]["SearchAnswerEntryResponse"];
type SearchItem = components["schemas"]["AnswerEntrySummaryResponse"];

export const Route = createFileRoute("/_authenticated/search/")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(searchHistoryOptions);
  },
});
// Todo: 리펙토링 혹은 파일 분리 필요...
function RouteComponent() {
  const navigate = useNavigate();
  const { data: searchHistories } = useSuspenseQuery(searchHistoryOptions);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchEmotion, setSearchEmotion] = useState<
    undefined | (typeof emotions)[number]["code"]
  >(undefined);
  const [debouncedSearchTerm] = useDebounce(
    searchTerm,
    searchTerm === "" ? 0 : 300,
  );
  const isSearching = debouncedSearchTerm.trim().length > 0 || !!searchEmotion;
  const { ref, inView } = useInView();
  const addHistoryMutation = useAddHistoryMutation();
  const deleteHistoriesMutation = useDeleteHistoriesMutation();
  const deleteHistoryMutation = useDeleteHistoryMutation();
  const {
    data: searchResults,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "currentUser",
      "searchResults",
      debouncedSearchTerm,
      searchEmotion,
    ],
    queryFn: async ({ pageParam }) => {
      const req: AnswersReq = {
        keyword: debouncedSearchTerm || undefined,
        emotionCode: searchEmotion,
        cursor: pageParam || undefined,
      };
      const res = await api.get<ApiResponse<AnswersRes>>("/api/v1/answers", {
        params: req,
      });

      return res.data.data!;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : null,
    enabled: isSearching,
  });

  const hasResult = searchResults?.pages.some(
    (page) => (page.items?.length ?? 0) > 0,
  );

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
            if (searchTerm) {
              addHistoryMutation.mutate({ keyword: searchTerm });
            }
          }}
        >
          <SearchBar
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            emotion={searchEmotion}
            onDeleteEmotion={() => setSearchEmotion(undefined)}
            onDeleteKeyword={() => setSearchTerm("")}
            placeholder={
              searchEmotion ? "" : "검색을 통해 기록을 되돌아보세요."
            }
            className="mr-margin-x-l h-10"
          />
        </form>
      </SubHeader>
      <Container>
        {isSearching ? (
          // 검색어가 있을 때
          <div className="my-margin-y-l h-full flex flex-col">
            {isFetching ? (
              <SearchResultSkeleton />
            ) : (
              <>
                {!hasResult && (
                  <NoResult
                    className="my-auto pb-header-height"
                    title={`검색어를 포함하는\n기록을 찾을 수 없어요.`}
                    description="다른 검색어로 다시 찾아보세요."
                  />
                )}
                {searchResults?.pages.map((page, i) => {
                  return (
                    <ul key={i} className="list-none flex flex-col gap-gap-y-l">
                      {page.items?.map((item) => {
                        return (
                          <SearchResultItem
                            onClick={() => {
                              if (debouncedSearchTerm) {
                                addHistoryMutation.mutate({
                                  keyword: debouncedSearchTerm,
                                });
                              }
                              navigate({
                                to: "/detail/$date",
                                params: { date: item.answerDate! },
                              });
                            }}
                            item={item}
                            key={item.answerId}
                          />
                        );
                      })}
                    </ul>
                  );
                })}
                {isFetchingNextPage && <SearchResultSkeleton />}
              </>
            )}
          </div>
        ) : (
          // 검색어가 없을 때(첫 접속 시 화면)
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
                      // 검색어 버튼
                      <div
                        key={item.id}
                        onClick={() => setSearchTerm(item.keyword!)}
                        className="flex gap-gap-x-xs bg-button-tertiary-bg-default border border-button-tertiary-border-default rounded-full text-button-2 px-padding-x-m py-padding-y-xs"
                      >
                        <span>{item.keyword}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryMutation.mutate({
                              historyId: item.id!,
                            });
                          }}
                        >
                          <CloseFilledIcon />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </KeywordSection>
            )}

            <KeywordSection header={<span>기록의 색상으로 검색하기</span>}>
              <div className="grid grid-cols-3 gap-1.5">
                {emotions.map((emotion) => {
                  return (
                    <button
                      key={emotion.code}
                      onClick={() => setSearchEmotion(emotion.code)}
                    >
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
    <>
      <ul className="list-none flex flex-col gap-gap-y-l">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <li
              key={i}
              className="px-padding-x-m py-padding-y-m rounded-lg bg-surface-layer-2 animate-pulse"
            >
              <div className="invisible">
                <div className="flex gap-padding-x-xxs">
                  <QuestionBadge category={"PREFERENCE"} />
                  <EmotionBadge emotion={"ACHIEVEMENT"} />
                  <span className="text-caption-s text-text-tertiary ml-auto">
                    test
                  </span>
                </div>
                <p className="text-label-l">test</p>
                <p className="text-caption-m text-text-secondary">test</p>
              </div>
            </li>
          ))}
      </ul>
    </>
  );
}

function SearchResultItem({
  item,
  onClick,
}: {
  item: SearchItem;
  onClick: () => void;
}) {
  return (
    <li
      onClick={onClick}
      className="px-padding-x-m py-padding-y-m bg-surface-base border border-border-base rounded-lg"
    >
      <div className="flex gap-padding-x-xxs">
        <QuestionBadge
          category={item.interestCode as (typeof categories)[number]["code"]}
          filled
        />
        <EmotionBadge
          emotion={item.emotionCode as (typeof emotions)[number]["code"]}
          filled
        />
        <span className="text-caption-s text-text-tertiary ml-auto">
          {item.answerDate}
        </span>
      </div>
      <p className="text-label-l">{item.questionText}</p>
      <p className="text-caption-m text-text-secondary truncate">
        {item.matchedSnippet}
      </p>
    </li>
  );
}
