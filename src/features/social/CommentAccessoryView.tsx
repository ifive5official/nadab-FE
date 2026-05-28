// 키보드 위에 올라오는 악세서리 뷰
// 댓글 작성 시 사용
import { motion } from "motion/react";
import CommentInput from "./CommentInput";
import CheckBox from "@/components/Checkbox";
import { useEffect, useRef, useState } from "react";
import {
  usePostCommentMutation,
  usePostSubCommentMutation,
  useUpdateCommentMutation,
} from "./commentQueries";
import clsx from "clsx";
import useToastStore from "@/store/toastStore";
import useCommentInputStore from "@/store/commentInputStore";
import useModalStore from "@/store/modalStore";
import { CircleCheckFilledIcon } from "@/components/Icons";
import { Capacitor } from "@capacitor/core";

export default function CommentAccessoryView() {
  const { showModal, closeModal } = useModalStore();
  const { showToast } = useToastStore();
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

  // CommentInput 제어용
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // 수정 모드일 때 이전 댓글 정보 반영
  const [prevMode, setPrevMode] = useState(mode);
  const [prevCommentId, setPrevCommentId] = useState(commentId);

  if (mode !== prevMode || commentId !== prevCommentId) {
    setPrevMode(mode);
    setPrevCommentId(commentId);
    if (mode === "EDIT") {
      setContent(originalCommentContent ?? "");
      setIsSecret(isOriginalCommentSecret ?? false);
    } else {
      setContent("");
      setIsSecret(false);
    }
  }

  // 수정 및 답글 작성 시 자동 포커스
  useEffect(() => {
    if (mode === "EDIT" && inputRef.current) {
      inputRef.current.focus();
    } else if (mode === "SUB" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode, commentId]);

  // 댓글 작성, 대댓글 작성, 댓글 수정
  const postCommentMutation = usePostCommentMutation({
    onSuccess: triggerScrollToTop,
  });
  const postSubCommentMutation = usePostSubCommentMutation({
    // onSuccess: handlePostCommentSuccessfully,
  });
  const updateCommentMutation = useUpdateCommentMutation({
    onSuccess: () => {
      showModal({
        icon: CircleCheckFilledIcon,
        title: "댓글을\n수정 완료했어요.",
        buttons: [
          {
            label: "확인",
            onClick: () => {
              closeModal();
            },
          },
        ],
      });
    },
  });

  // 부모가 비밀댓글이면 자식은 무조건 비밀댓글
  const finalIsSecret = isParentSecret ? true : isSecret;

  // ios safe bottom 대비
  const platform = Capacitor.getPlatform();
  const bottomClass =
    platform === "ios"
      ? isFocused
        ? "bottom-0"
        : "bottom-(--safe-bottom)"
      : "bottom-(--safe-bottom)";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={clsx(
        "bg-surface-base dark:bg-surface-layer-2 w-full sm:w-[412px] sm:mx-auto fixed inset-x-0 flex items-center gap-padding-x-s px-padding-x-s border-t border-t-border-base dark:border-t-border-layer-1",
        bottomClass,
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
          if (inputRef.current) {
            inputRef.current.blur();
          }
          setIsFocused(false);
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
          inputRef={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onReset={() => setWriteMode(dailyReportId!)}
          isFocused={isFocused}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </form>
    </motion.div>
  );
}
