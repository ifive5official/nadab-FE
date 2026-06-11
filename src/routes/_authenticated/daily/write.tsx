// import BlockButton from "@/components/BlockButton";
import { SubHeader } from "@/components/Headers";
import { PlusIcon, WarningFilledIcon } from "@/components/Icons";
import { CrystalBadge } from "@/components/Badges";
import {
  createFileRoute,
  useBlocker,
  useNavigate,
} from "@tanstack/react-router";
import { useRef, useState } from "react";
import { QuestionSection } from "@/features/daily/QuestionSection";
import Container from "@/components/Container";
import { questionOptions } from "@/features/question/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useGenerateReportMutation } from "@/features/report/hooks/useGenerateReportMutation";
import useModalStore from "@/store/modalStore";
import AnswerAccessoryView from "@/features/daily/AnswerAccessoryView";
import { useImageUploader } from "@/hooks/useImageUpload";
import { ImageCropper } from "@/components/ImageCropper";
import useToastStore from "@/store/toastStore";
import { Capacitor } from "@capacitor/core";
import clsx from "clsx";
import BlockButton from "@/components/BlockButton";

export const Route = createFileRoute("/_authenticated/daily/write")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(questionOptions);
  },
});

function RouteComponent() {
  // ios 강제 스크롤로 인한 엑세서리 바 버그 해결용...
  const [isFocused, setIsFocused] = useState(false);

  const navigate = useNavigate();
  const { data: question } = useSuspenseQuery(questionOptions);
  const [answer, setAnswer] = useState("");
  const canSubmit = answer.trim().length >= 10;
  const { isOpen, showModal, showError, closeModal } = useModalStore();
  const { showToast } = useToastStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageUploader = useImageUploader({
    onUpload: () => {
      if (textareaRef.current) {
        textareaRef.current.blur();
      }
    },
    apiUrl: "/api/v1/daily-report/image/upload-url",
    onUploadError: (e) => {
      console.log("답변 이미지 업로드 에러:", e);
      if (e.message?.toLowerCase().includes("canceled")) {
        return;
      }
      if (textareaRef.current) {
        textareaRef.current.blur();
      }
      if (
        Capacitor.isNativePlatform() &&
        (e.message.includes("denied") || e.message.includes("permission"))
      ) {
        showToast({
          message: "설정에서 카메라 권한을 허용해 주세요.",
        });
      } else {
        showError(
          "이미지 업로드 중 문제가 발생했어요.",
          "다시 한번 시도해 주세요.",
        );
      }
    },
  });
  const {
    cropTarget,
    setCropTarget,
    handleCropComplete,
    uploadImage,
    isUploading: isImageUploading,
  } = imageUploader;

  const generateResponseMutation = useGenerateReportMutation({
    onSuccess: (reportId) => {
      if (textareaRef.current) {
        textareaRef.current.blur();
      }
      // 키보드 닫히는 시간 확보
      setTimeout(
        () => {
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
          });
        },
        Capacitor.getPlatform() === "android" ? 300 : 500,
      );
    },
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

  function closeCropperAndRefocus() {
    setCropTarget(null);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }

  async function handleComplete() {
    if (canSubmit) {
      try {
        const uploadResult = await uploadImage();
        generateResponseMutation.mutate({
          questionId: question?.questionId ?? 0,
          answer,
          objectKey: uploadResult?.objectKey,
          webpKey: uploadResult?.webpKey,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      if (textareaRef.current) {
        textareaRef.current.blur();
      }
      showError(
        "10글자 이상 작성해 주세요.",
        "정교한 분석을 위해 조금만 더 자세히 답변해 주세요.",
      );
    }
  }

  const platform = Capacitor.getPlatform();
  const isMobile = platform !== "web"; // 완료 버튼 공개 여부 판단

  return (
    <>
      <SubHeader>오늘의 질문</SubHeader>
      <Container>
        <div className="flex-1 flex flex-col gap-gap-y-xl py-padding-y-m">
          <QuestionSection question={question!} />
          <div>
            <div className="border-b border-interactive-border-default" />
            {!isFocused && (
              <div
                onClick={() => {
                  setIsFocused(true);
                  textareaRef.current?.focus(); // 상단에 있는 진짜 인풋에 포커스
                }}
                className={clsx(
                  "box-content w-full my-margin-y-m text-caption-l h-36 cursor-text whitespace-pre-line overflow-y-auto",
                  !answer ? "text-text-disabled" : "text-text-primary",
                )}
              >
                {answer || "내용을 입력하세요."}
              </div>
            )}
            <textarea
              ref={textareaRef}
              rows={6}
              maxLength={200}
              className={clsx(
                "block box-content h-36 w-full resize-none outline-0 my-margin-y-m text-caption-l placeholder:text-text-disabled",
                isFocused
                  ? "relative opacity-100"
                  : "absolute top-[-100vh] left-0 opacity-0 pointer-events-none",
              )}
              placeholder="내용을 입력하세요."
              onChange={(e) => setAnswer(e.target.value)}
              onBlur={() => setIsFocused(false)}
              value={answer}
            />
            <div className="border-b border-interactive-border-default" />
          </div>
          <div className="text-caption-s text-right">
            <span>{answer.length}</span>
            <span className="text-text-tertiary">/200자</span>
          </div>
        </div>
        {!isMobile && (
          <BlockButton
            variant="primary"
            onClick={handleComplete}
            isLoading={generateResponseMutation.isPending || isImageUploading}
          >
            완료
          </BlockButton>
        )}
        <AnswerAccessoryView
          imageUploader={imageUploader}
          isLoading={generateResponseMutation.isPending}
          onComplete={handleComplete}
        />
      </Container>
      {cropTarget && (
        <ImageCropper
          image={cropTarget}
          onConfirm={(pixels) => {
            handleCropComplete(pixels);
            closeCropperAndRefocus();
          }}
          onCancel={closeCropperAndRefocus}
        />
      )}
    </>
  );
}
