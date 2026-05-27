// 키보드 위에 올라오는 악세서리 뷰
// 댓글 작성 시 사용
import { motion } from "motion/react";
import CommentInput from "./CommentInput";
import CheckBox from "@/components/Checkbox";
import { useState } from "react";
import {
  usePostCommentMutation,
  usePostSubCommentMutation,
  useUpdateCommentMutation,
} from "./commentQueries";
import clsx from "clsx";
import useToastStore from "@/store/toastStore";
import useCommentInputStore from "@/store/commentInputStore";

export default function CommentAccessoryView() {
  const {
    mode,
    dailyReportId,
    parentCommentId,
    parentCommentAuthorNickname,
    isParentSecret,
    commentId,
    originalCommentContent,
    isOriginalCommentSecret,
    setWriteMode,
    triggerScrollToTop,
  } = useCommentInputStore();

  const [isSecret, setIsSecret] = useState(false);
  const [content, setContent] = useState(originalCommentContent ?? "");

  const [prevMode, setPrevMode] = useState(mode);

  // 수정 모드일 때 이전 댓글 정보 반영
  if (mode !== prevMode) {
    setPrevMode(mode);
    if (mode === "EDIT") {
      setContent(originalCommentContent ?? "");
      setIsSecret(isOriginalCommentSecret ?? false);
    } else {
      setContent("");
      setIsSecret(false);
    }
  }

  function handlePostCommentSuccessfully() {
    const nav = navigator as any;
    const isMobile = nav.userAgentData?.mobile;
    if (isMobile) {
      const activeEl = document.activeElement as HTMLElement;
      if (activeEl && activeEl.tagName === "INPUT") {
        activeEl.blur();
      }
    }
    triggerScrollToTop();
  }

  const postCommentMutation = usePostCommentMutation({
    onSuccess: handlePostCommentSuccessfully,
  });
  const postSubCommentMutation = usePostSubCommentMutation({
    // onSuccess: handlePostCommentSuccessfully,
  });
  const updateCommentMutation = useUpdateCommentMutation();

  const { showToast } = useToastStore();

  // 부모가 비밀댓글이면 자식은 무조건 비밀댓글
  const finalIsSecret = isParentSecret ? true : isSecret;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={clsx(
        "bg-surface-base dark:bg-surface-layer-2 w-full sm:w-[412px] sm:mx-auto fixed bottom-(--safe-bottom) inset-x-0 flex items-center gap-padding-x-s px-padding-x-s border-t border-t-border-base dark:border-t-border-layer-1",
        parentCommentAuthorNickname ? "h-[104px]" : "h-16",
      )}
    >
      <div
        // 엑세서리 바 누를 때 포커스 이탈 방지
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onPointerMove={(e) => e.stopPropagation()}
      >
        <CheckBox
          boxSize="s"
          textSize="text-caption-s"
          checked={finalIsSecret}
          onCheck={() => {
            if (mode === "EDIT") {
              showToast({ message: "비밀 댓글 여부는 변경할 수 없어요." });
            } else if (isParentSecret) {
              showToast({
                message: "비공개 댓글의 대댓글은 공개로 변경할 수 없어요.",
              });
            } else {
              setIsSecret((prev) => !prev);
            }
          }}
          label="비밀 댓글"
          className="whitespace-pre"
        />
      </div>
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          setIsSecret(false);
          setContent("");
          setWriteMode(dailyReportId!);
          if (mode === "SUB") {
            postSubCommentMutation.mutate({
              dailyReportId: dailyReportId!,
              commentId: parentCommentId!,
              content,
              isSecret: finalIsSecret,
            });
          } else if (mode === "WRITE") {
            postCommentMutation.mutate({
              dailyReportId: dailyReportId!,
              content,
              isSecret: finalIsSecret,
            });
          } else if (mode === "EDIT") {
            updateCommentMutation.mutate({
              dailyReportId: dailyReportId!,
              content,
              commentId: commentId!,
              parentCommentId: parentCommentId!,
            });
          }
        }}
      >
        <CommentInput
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onReset={() => setWriteMode(dailyReportId!)}
        />
      </form>
    </motion.div>
  );
}
