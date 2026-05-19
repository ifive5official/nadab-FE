import Container from "@/components/Container";
import Post from "./Post";
import { useQuery, useSuspenseQueries } from "@tanstack/react-query";
import { feedOptions, friendsOptions } from "./queries";
import ShareBanner from "@/components/ShareBanner";
import NoResult from "@/components/NoResult";
import Seperator from "@/components/Seperator";
import { answerOptions } from "../report/quries";
import { formatISODate } from "@/lib/formatters";
import { currentUserOptions } from "../user/quries";
import clsx from "clsx";

export default function FeedTab() {
  const [{ data: feedData }, { data: friends }, { data: currentUser }] =
    useSuspenseQueries({
      queries: [feedOptions, friendsOptions, currentUserOptions],
    });
  const { data: myReport } = useQuery(
    answerOptions.detail(formatISODate(new Date())),
  );
  const feeds = feedData.feeds;

  return (
    <>
      <Container
        isMain={true}
        className="border-t border-t-interactive-border-default"
      >
        <span className="text-caption-m mt-gap-y-m">나의 기록</span>
        <ShareBanner
          disabled={!myReport || friends.totalCount === 0}
          className="my-margin-y-m"
        />
        {myReport && (
          <Post
            isMine
            className="mb-padding-y-l"
            feed={{
              dailyReportId: 0,
              friendNickname: currentUser?.nickname,
              friendProfileImageUrl: currentUser?.profileImageUrl,
              interestCode: myReport.interestCode,
              questionText: myReport.questionText,
              answer: myReport.answer,
              emotionCode: myReport.emotion,
              imageUrl: myReport.imageUrl,
            }}
          />
        )}
        <Seperator />
        <span className="text-caption-m mt-gap-y-m mb-padding-y-s">
          친구의 기록
        </span>
        {friends?.totalCount === 0 ? (
          <NoResult
            title="아직은 친구가 없어요."
            description="친구 탭에서 친구를 추가하고 기록을 나눠보세요."
            className={clsx(
              myReport
                ? "my-margin-y-xxl"
                : "mt-[calc((77/796)*100*var(--dvh))]",
            )}
          />
        ) : (
          <>
            {/* 게시글 */}
            <div className="flex flex-col gap-margin-y-l">
              {feeds?.length === 0 && (
                <NoResult
                  title="아직 공유된 글이 없어요."
                  description="친구의 기록이 공유되면 피드에서 확인할 수 있어요."
                  className={clsx(
                    myReport
                      ? "my-margin-y-xxl"
                      : "mt-[calc((77/796)*100*var(--dvh))]",
                  )}
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
