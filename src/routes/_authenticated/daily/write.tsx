import BlockButton from "@/components/BlockButton";
import { SubHeader } from "@/components/Headers";
import { PlusIcon, WarningFilledIcon } from "@/components/Icons";
import { CrystalBadge } from "@/components/Badges";
import {
  createFileRoute,
  useBlocker,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { QuestionSection } from "@/features/daily/QuestionSection";
import Container from "@/components/Container";
import { questionOptions } from "@/features/question/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useGenerateReportMutation } from "@/features/report/hooks/useGenerateReportMutation";
import useModalStore from "@/store/modalStore";
import InputAccessoryView from "@/components/InputAccessoryView";
import { useImageUploader } from "@/hooks/useImageUpload";
import { Keyboard } from "@capacitor/keyboard";

export const Route = createFileRoute("/_authenticated/daily/write")({
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
  const { isOpen, showModal, showError, closeModal } = useModalStore();
  const imageUploader = useImageUploader({
    apiUrl: "/api/v1/daily-report/image/upload-url",
    onUploadError: (e) => {
      if (e.message?.toLowerCase().includes("cancelled")) {
        return;
      }
      Keyboard.hide();
      console.error(e);
      showError(
        "이미지 업로드 중 문제가 발생했어요.",
        "다시 한번 시도해 주세요.",
      );
    },
  });
  const { uploadedImageUrl, isUploading: isImageUploading } = imageUploader;

  const generateResponseMutation = useGenerateReportMutation({
    onSuccess: (reportId) =>
      showModal({
        title: `오늘의 답변으로\n크리스탈을 획득했어요.`,
        icon: () => (
          <div className="flex items-center mb-margin-y-s">
            <PlusIcon />
            <CrystalBadge height={32.5} crystals={10} />
          </div>
        ),
        buttons: [
          {
            label: "홈으로",
            onClick: () => {
              closeModal();
              navigate({ to: "/" });
            },
          },
          {
            label: "리포트 보기",
            onClick: () => {
              closeModal();
              navigate({ to: `/daily/report/${reportId}` });
            },
          },
        ],
      }),
  });

  useBlocker({
    shouldBlockFn: () => {
      // 충분히 글을 쓴 상태에서는 네비게이션 막고 모달 띄움
      const canLeave = !canSubmit || (canSubmit && isOpen);
      if (!canLeave) {
        showModal({
          title: `떠나시겠어요? 작성 중인 내용은 삭제돼요.`,
          icon: WarningFilledIcon,
          buttons: [
            {
              label: "떠날래요.",
              onClick: () => {
                closeModal();
                navigate({ to: "/" });
              },
            },
            {
              label: "머물래요.",
              onClick: closeModal,
            },
          ],
        });
      }
      return !canLeave;
    },
  });

  function handleComplete() {
    if (canSubmit) {
      generateResponseMutation.mutate({
        questionId: question?.questionId ?? 0,
        answer,
        objectKey: uploadedImageUrl,
      });
    } else {
      showError(
        "10글자 이상 작성해 주세요.",
        "정교한 분석을 위해 조금만 더 자세히 답변해 주세요.",
      );
    }
  }

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
          variant="primary"
          onClick={handleComplete}
          isLoading={generateResponseMutation.isPending || isImageUploading}
        >
          완료
        </BlockButton>
        <InputAccessoryView
          imageUploader={imageUploader}
          isLoading={generateResponseMutation.isPending}
          onComplete={handleComplete}
        />
      </Container>
    </>
  );
}
