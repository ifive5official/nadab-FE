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
      <h2 className="text-title-2">
        당신의 가장 어두운 면을 아는 사람 앞에서, 당신은 여전히 그 면을 숨기려
        하나요 아니면 온전히 받아들여졌다고 느끼나요?
      </h2>
    </div>
  );
}
