import { EmotionBadge, QuestionBadge } from "@/components/Badges";
import { useState, useRef, useLayoutEffect } from "react";
import clsx from "clsx";

export default function Post() {
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false); // 텍스트가 넘치는가?
  const answerRef = useRef<HTMLParagraphElement>(null);

  // 더보기 버튼 여부 처리 위해 답변 높이 측정
  useLayoutEffect(() => {
    const checkOverflow = () => {
      const element = answerRef.current;
      if (element) {
        setIsOverflowing(element.scrollHeight > element.clientHeight);
      }
    };

    checkOverflow();
  }, []);

  return (
    <section className="px-padding-x-m py-padding-y-m rounded-2xl bg-surface-layer-1 border border-border-base shadow-1">
      <div className="flex items-center gap-margin-x-s">
        <div className="rounded-full aspect-square h-[35px] bg-neutral-300" />
        <span className="text-button-1">알케르닉스</span>
      </div>
      <div className="border-b border-b-surface-layer-2 my-margin-y-m" />
      <div className="flex justify-start">
        <QuestionBadge category="PREFERENCE" />
      </div>
      <p className="text-title-3 mt-margin-y-s mb-margin-y-l">
        설렘의 순간은 언제였나요?
      </p>
      <div className="flex flex-col px-padding-x-m py-padding-y-m bg-interactive-bg-default rounded-2xl border border-border-base overflow-hidden">
        <EmotionBadge
          emotion="ACHIEVEMENT"
          filled
          className="mr-auto mb-padding-y-xs"
        />
        {/* eslint-disable react/no-unescaped-entities */}
        <p
          ref={answerRef}
          className={clsx(
            "text-body-2 text-text-secondary",
            !isAnswerOpen && "line-clamp-2",
          )}
        >
          오늘의 이야기는 그 영광이 단순히 '결과'가 아니라, 수많은 고민과 노력을
          거쳐 '나는 해낼 수 있다'는 믿음을 스스로 증명해낸 '과정' 그 자체였음을
          보여줘요. 당신 안에 잠재된 힘을 다시 한번 발견한 소중한 기록입니다. 이
          기록은 미래의 당신과 연결될 첫 번째 조각이 될 거예요.오늘의 이야기는
          그 영광이 단순히 '결과'가 아니라,
        </p>
        {isOverflowing && (
          <button
            onClick={() => setIsAnswerOpen((prev) => !prev)}
            className="text-body-2 text-text-secondary ml-auto mt-margin-y-xs"
          >
            {isAnswerOpen ? "접기" : "더보기"}
          </button>
        )}
      </div>
    </section>
  );
}
