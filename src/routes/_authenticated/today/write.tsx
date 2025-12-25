import BlockButton from "@/components/BlockButton";
import { SubHeader } from "@/components/Headers";
import QuestionBadge from "@/components/QuestionBadge";
import { formatDate } from "@/lib/formatDate";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/today/write")({
  component: RouteComponent,
});

function RouteComponent() {
  const [answer, setAnswer] = useState("");
  return (
    <>
      <SubHeader>오늘의 질문</SubHeader>
      <main className="flex flex-col h-full">
        <div className="flex-1 flex flex-col gap-gap-y-xl py-padding-y-m">
          <div className="flex flex-col gap-gap-y-s">
            <div className="flex justify-between">
              <QuestionBadge category="취향" />
              <span className="text-caption-s text-text-tertiary">
                {formatDate(new Date())}
              </span>
            </div>
            <h2 className="text-title-2">
              당신의 가장 어두운 면을 아는 사람 앞에서, 당신은 여전히 그 면을
              숨기려 하나요 아니면 온전히 받아들여졌다고 느끼나요?
            </h2>
          </div>
          <div>
            <div className="border-b border-interactive-border-default" />
            <textarea
              rows={6}
              maxLength={200}
              className="w-full resize-none outline-0 my-margin-y-m text-caption-l placeholder:text-text-disabled"
              placeholder="내용을 입력하세요."
              onChange={(e) => setAnswer(e.target.value)}
            >
              {answer}
            </textarea>
            <div className="border-b border-interactive-border-default" />
          </div>
          <div className="text-caption-s text-right">
            <span>{answer.length}</span>
            <span className="text-text-tertiary">/200자</span>
          </div>
        </div>
        <BlockButton disabled={!answer.trim()}>완료</BlockButton>
      </main>
    </>
  );
}
