import { AppIcon } from "@/components/AppIcon";
import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { LoadingIcon } from "@/components/Icons";
import NoResult from "@/components/NoResult";
import { askChatHistoriesOptions } from "@/features/ask/queries";
import type { components } from "@/generated/api-types";
import { formatRelativeDate } from "@/lib/formatters";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";

type AskChatHistoryItem =
  components["schemas"]["AskChatHistoryItemResponse"];

const ASK_CHAT_HISTORY_PAGE_SIZE = 20;

export const Route = createFileRoute("/_authenticated/ask/archive")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureInfiniteQueryData(
      askChatHistoriesOptions(ASK_CHAT_HISTORY_PAGE_SIZE),
    ),
  pendingComponent: AskArchiveLoading,
});

// 물어보기 히스토리를 최신순으로 불러와 보관함 목록을 렌더링합니다.
function RouteComponent() {
  const { ref, inView } = useInView();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(
    askChatHistoriesOptions(ASK_CHAT_HISTORY_PAGE_SIZE),
  );
  const histories = useMemo(
    () => data.pages.flatMap((page) => page.histories ?? []),
    [data.pages],
  );
  const totalCount = data.pages[0]?.totalCount ?? histories.length;

  useEffect(() => {
    if (!inView || !hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  return (
    <>
      <SubHeader>수정구슬에게 물어보기</SubHeader>
      <Container className="bg-surface-base text-text-primary">
        {histories.length > 0 ? (
          <div className="flex flex-col gap-gap-y-m py-padding-y-m">
            <p className="text-caption-m text-text-tertiary">
              총 {totalCount}개의 대화
            </p>
            <ul className="flex flex-col gap-gap-y-s">
              {histories.map((history, index) => (
                <AskHistoryCard
                  key={history.sessionId ?? `ask-history-${index}`}
                  history={history}
                />
              ))}
            </ul>
            {hasNextPage && (
              <div
                ref={ref}
                className="flex min-h-12 items-center justify-center"
              >
                {isFetchingNextPage && (
                  <LoadingIcon color="var(--color-icon-primary)" />
                )}
              </div>
            )}
          </div>
        ) : (
          <NoResult
            className="my-auto"
            title="아직 지난 대화가 없어요."
            description={"수정구슬에게 궁금한 모습을 물어보면\n여기에 대화가 모여요."}
          />
        )}
      </Container>
    </>
  );
}

// 보관함 항목에서 첫 질문 제목과 마지막 대화 시각을 간결하게 보여줍니다.
function AskHistoryCard({ history }: { history: AskChatHistoryItem }) {
  const timestamp = history.lastMessageAt ?? history.createdDate;

  if (!history.sessionId) return null;

  return (
    <li>
      <Link
        to="/ask/chat"
        search={{ sessionId: history.sessionId }}
        className="flex items-center justify-between gap-gap-x-l rounded-xl border border-border-base px-padding-x-m py-padding-y-s text-left"
      >
        <div className="flex min-w-0 flex-1 flex-col items-start gap-gap-y-xs">
          <div className="flex w-full items-center gap-gap-x-xs">
            <span className="min-w-0 flex-1 truncate text-label-l text-text-primary">
              {history.title ?? "제목 없는 대화"}
            </span>
            {history.status === "ENDED" && (
              <span className="shrink-0 rounded-full bg-surface-layer-1 px-padding-x-xs py-padding-y-xxs text-caption-s text-text-tertiary">
                종료
              </span>
            )}
          </div>
          {timestamp && (
            <span className="text-caption-m text-icon-muted">
              {formatRelativeDate(timestamp)}
            </span>
          )}
        </div>
        <AppIcon
          name="chevron-right-filled"
          size={24}
          color="default"
          className="shrink-0"
        />
      </Link>
    </li>
  );
}

// 보관함 첫 데이터를 불러오는 동안 공통 헤더와 로딩 상태를 표시합니다.
function AskArchiveLoading() {
  return (
    <>
      <SubHeader>수정구슬에게 물어보기</SubHeader>
      <Container className="items-center justify-center bg-surface-base">
        <LoadingIcon color="var(--color-icon-primary)" />
      </Container>
    </>
  );
}
