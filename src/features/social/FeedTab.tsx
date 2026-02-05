import Container from "@/components/Container";
import Post from "./Post";
import { useSuspenseQueries } from "@tanstack/react-query";
import { feedOptions, friendsOptions } from "./queries";
import ShareBanner from "@/components/ShareBanner";
import NoResult from "@/components/NoResult";

export default function FeedTab() {
  const [feedQuery, friendsQuery] = useSuspenseQueries({
    queries: [feedOptions, friendsOptions],
  });
  const feeds = feedQuery.data?.feeds;

  return (
    <>
      <Container
        hasHeader={false}
        className="border-t border-t-interactive-border-default"
      >
        {friendsQuery?.data?.totalCount === 0 ? (
          <NoResult
            title="아직은 친구가 없어요."
            description="친구 탭에서 친구를 추가하고 기록을 나눠보세요."
            className="mt-[calc((160/796)*100dvh)]"
          />
        ) : (
          <>
            <ShareBanner className="my-margin-y-l" />
            {/* 게시글 */}
            <div className="flex flex-col gap-margin-y-l">
              {feeds?.length === 0 && (
                <NoResult
                  title="아직 공유된 글이 없어요."
                  description="친구의 기록이 공유되면 피드에서 확인할 수 있어요."
                  className="mt-[calc((110/796)*100dvh)]"
                />
              )}
              {feeds?.map((feed) => (
                <Post feed={feed} key={feed.friendNickname} />
              ))}
            </div>
          </>
        )}
      </Container>
    </>
  );
}
