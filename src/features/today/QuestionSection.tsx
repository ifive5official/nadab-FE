// 오늘의 질문 / 오늘의 분석 페이지에서 사용
// 카테고리 뱃지 + 날짜 + 질문 섹션
import { QuestionBadge } from "@/components/Badges";
import type { components } from "@/generated/api-types";
import { formatKoreanDate } from "@/lib/formatDate";
import categories from "@/constants/categories";

type Question = components["schemas"]["DailyQuestionResponse"];

// Todo: 질문 props로 받기
type Props = {
  question: Question;
};

export function QuestionSection({ question }: Props) {
  return (
    <div className="flex flex-col gap-gap-y-s">
      <div className="flex justify-between">
        <QuestionBadge
          category={
            question.interestCode! as (typeof categories)[number]["code"]
          }
        />
        <span className="text-caption-s text-text-tertiary">
          {formatKoreanDate(new Date())}
        </span>
      </div>
      <h2 className="text-title-2 break-keep">{question.questionText}</h2>
    </div>
  );
}
