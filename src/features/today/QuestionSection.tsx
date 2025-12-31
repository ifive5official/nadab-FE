// 오늘의 질문 / 오늘의 분석 페이지에서 사용
// 카테고리 뱃지 + 날짜 + 질문 섹션
import { QuestionBadge } from "@/components/Badges";
import type { components } from "@/generated/api-types";
import { formatDate } from "@/lib/formatDate";
import categories from "@/constants/categories";

type Question = components["schemas"]["DailyQuestionResponse"];

// Todo: 질문 props로 받기
type Props = {
  question: Question;
};

export function QuestionSection({ question }: Props) {
  const category = categories.find(
    (category) => category.code === question.interestCode
  )?.title;
  return (
    <div className="flex flex-col gap-gap-y-s">
      <div className="flex justify-between">
        <QuestionBadge category={category!} />
        <span className="text-caption-s text-text-tertiary">
          {formatDate(new Date())}
        </span>
      </div>
      <h2 className="text-title-2 break-keep">{question.questionText}</h2>
    </div>
  );
}
