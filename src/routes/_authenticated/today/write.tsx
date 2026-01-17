import BlockButton from "@/components/BlockButton";
import { SubHeader } from "@/components/Headers";
import { PlusIcon, WarningFilledIcon } from "@/components/Icons";
import Modal from "@/components/Modal";
import { CrystalBadge } from "@/components/Badges";
import {
  createFileRoute,
  useBlocker,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { QuestionSection } from "@/features/today/QuestionSection";
import Container from "@/components/Container";
import { questionOptions } from "@/features/question/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useGenerateReportMutation } from "@/features/report/hooks/useGenerateReportMutation";

export const Route = createFileRoute("/_authenticated/today/write")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(questionOptions);
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: question } = useSuspenseQuery(questionOptions);
  const [answer, setAnswer] = useState("");
  const canSubmit = answer.trim().length >= 10;
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const generateResponseMutation = useGenerateReportMutation({
    onSuccess: () => setIsCompleteModalOpen(true),
  });

  useBlocker({
    shouldBlockFn: () => {
      // 충분히 글을 쓴 상태에서는 네비게이션 막고 모달 띄움
      const canLeave =
        !canSubmit ||
        (canSubmit && isCompleteModalOpen) ||
        (canSubmit && isLeaveModalOpen);
      if (!canLeave) {
        setIsLeaveModalOpen(true);
      }
      return !canLeave;
    },
  });

  return (
    <>
      <SubHeader>오늘의 질문</SubHeader>
      <Container>
        <div className="flex-1 flex flex-col gap-gap-y-xl py-padding-y-m">
          <QuestionSection question={question!} />
          <div>
            <div className="border-b border-interactive-border-default" />
            <textarea
              rows={6}
              maxLength={200}
              className="w-full resize-none outline-0 my-margin-y-m text-caption-l placeholder:text-text-disabled"
              placeholder="내용을 입력하세요."
              onChange={(e) => setAnswer(e.target.value)}
              value={answer}
            />
            <div className="border-b border-interactive-border-default" />
          </div>
          <div className="text-caption-s text-right">
            <span>{answer.length}</span>
            <span className="text-text-tertiary">/200자</span>
          </div>
        </div>
        <BlockButton
          disabled={!canSubmit}
          onClick={() => {
            generateResponseMutation.mutate({
              questionId: question?.questionId ?? 0,
              answer,
            });
          }}
          isLoading={generateResponseMutation.isPending}
        >
          완료
        </BlockButton>
      </Container>

      {/* 뒤로가기 시도 시 뜨는 모달 */}
      <Modal
        title={`떠나시겠어요? 작성 중인 내용은 삭제돼요.`}
        icon={WarningFilledIcon}
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        buttons={[
          {
            label: "떠날래요.",
            onClick: () => navigate({ to: "/" }),
          },
          {
            label: "머물래요.",
            onClick: () => setIsLeaveModalOpen(false),
          },
        ]}
      />

      {/* 크리스탈 획득 모달 */}
      <Modal
        title={`오늘의 답변으로\n크리스탈을 획득했어요.`}
        icon={() => (
          <div className="flex items-center mb-margin-y-s">
            <PlusIcon />
            <CrystalBadge height={32.5} crystals={10} />
          </div>
        )}
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
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
