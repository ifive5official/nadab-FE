import Container from "@/components/Container";
import InlineButton from "@/components/InlineButton";
import Post from "./Post";

export default function FeedTab() {
  return (
    <>
      <Container
        hasHeader={false}
        className="border-t border-t-interactive-border-default"
      >
        {/* 공유하기 배너 */}
        <div className="bg-brand-primary-alpha-10 rounded-lg px-padding-x-m py-padding-y-m my-margin-y-l flex items-center justify-between ">
          <div className="flex flex-col">
            <span className="text-label-m">오늘 내가 쓴 기록을</span>
            <span className="text-title-3">친구들과 공유해볼까요?</span>
          </div>
          <InlineButton variant="tertiary">공유하기</InlineButton>
        </div>
        {/* 게시글 */}
        <div className="flex flex-col gap-margin-y-l">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Post key={i} />
            ))}
        </div>
      </Container>
    </>
  );
}
