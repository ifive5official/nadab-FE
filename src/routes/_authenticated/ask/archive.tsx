import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { AppIcon } from "@/components/AppIcon";
import { QuestionBadge } from "@/components/Badges";
import { formatRelativeDate } from "@/lib/formatters";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/ask/archive")({
  component: RouteComponent,
});

const ARCHIVED_CHATS = [
  {
    id: "archive-1",
    category: "VALUES",
    title: "나는 어떤 사람이야?",
    createdAt: new Date().toISOString(),
  },
  {
    id: "archive-2",
    category: "PREFERENCE",
    title: "내 장점은 뭐야?",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "archive-3",
    category: "RELATIONSHIP",
    title: "어떤 사람과 잘 맞을까?",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
] as const;

// 물어보기 지난 대화 목록 아카이브 화면을 렌더링합니다.
function RouteComponent() {
  return (
    <>
      <SubHeader>수정구슬에게 물어보기</SubHeader>
      <Container className="bg-surface-base text-text-primary">
        <div className="flex flex-col gap-gap-y-m py-padding-y-m">
          {ARCHIVED_CHATS.map((chat) => (
            <button
              key={chat.id}
              type="button"
              className="flex items-center justify-between gap-gap-x-l rounded-2xl border border-border-base px-padding-x-m py-padding-y-s text-left"
            >
              <div className="flex min-w-0 flex-col items-start gap-gap-y-xs">
                <QuestionBadge category={chat.category} filled />
                <span className="min-w-0 truncate text-label-l text-text-primary">
                  {chat.title}
                </span>
                <span className="text-caption-m text-icon-muted">
                  {formatRelativeDate(chat.createdAt)}
                </span>
              </div>
              <AppIcon
                name="chevron-right-filled"
                size={24}
                color="default"
                className="shrink-0"
              />
            </button>
          ))}
        </div>
      </Container>
    </>
  );
}
