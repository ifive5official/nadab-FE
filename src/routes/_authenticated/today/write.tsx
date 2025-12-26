import BlockButton from "@/components/BlockButton";
import { SubHeader } from "@/components/Headers";
import { PlusIcon } from "@/components/Icons";
import Modal from "@/components/Modal";
import { CrystalBadge } from "@/components/Badges";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { QuestionSection } from "@/features/today/QuestionSection";

export const Route = createFileRoute("/_authenticated/today/write")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <SubHeader>오늘의 질문</SubHeader>
      <main className="flex flex-col h-full">
        <div className="flex-1 flex flex-col gap-gap-y-xl py-padding-y-m">
          <QuestionSection />
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
        <BlockButton
          disabled={!answer.trim()}
          onClick={() => setIsModalOpen(true)}
        >
          완료
        </BlockButton>
      </main>
      <Modal
        title={`오늘의 답변으로\n크리스탈을 획득했어요.`}
        icon={() => (
          <div className="flex items-center mb-margin-y-s">
            <PlusIcon />
            <CrystalBadge height={32.5} crystals={10} />
          </div>
        )}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        buttons={[
          {
            label: "홈으로",
            onClick: () => navigate({ to: "/" }),
          },
          {
            label: "분석보기",
            onClick: () => navigate({ to: "/today/report" }),
          },
        ]}
      />
    </>
  );
}
