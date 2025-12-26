// 오늘의 질문 / 오늘의 분석 페이지에서 사용
// 카테고리 뱃지 + 날짜 + 질문 섹션
import { QuestionBadge } from "@/components/Badges";
import { formatDate } from "@/lib/formatDate";

// Todo: 질문 props로 받기
export function QuestionSection() {
  return (
    <div className="flex flex-col gap-gap-y-s">
      <div className="flex justify-between">
        <QuestionBadge category="취향" />
        <span className="text-caption-s text-text-tertiary">
          {formatDate(new Date())}
        </span>
      </div>
      <h2 className="text-title-2 break-keep">
        인생의 마지막 날, 되돌아본다면 나에게 어떤 말을 할까요?
      </h2>
    </div>
  );
}
