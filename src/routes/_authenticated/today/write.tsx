import { SubHeader } from "@/components/Headers";
import QuestionBadge from "@/components/QuestionBadge";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/today/write")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <SubHeader>오늘의 질문</SubHeader>
      <main>
        <div className="flex justify-between">
          <QuestionBadge category="취향" />
          <span>25년 11월 1일</span>
        </div>
      </main>
    </>
  );
}
