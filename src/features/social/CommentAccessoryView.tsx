// 키보드 위에 올라오는 악세서리 뷰
// 댓글 작성 시 사용
import { motion } from "motion/react";
// import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import CommentInput from "./CommentInput";
import CheckBox from "@/components/Checkbox";
import { useState } from "react";
import {
  usePostCommentMutation,
  usePostSubCommentMutation,
} from "./commentQueries";
import clsx from "clsx";
import useToastStore from "@/store/toastStore";

type Props = {
  dailyReportId: number;
  parentCommentId?: number;
  parentCommentAuthorNickname?: string;
  isParentCommentSecret?: boolean;
  onResetSubCommentTarget: () => void;
};

export default function CommentAccessoryView({
  dailyReportId,
  parentCommentId,
  parentCommentAuthorNickname,
  isParentCommentSecret,
  onResetSubCommentTarget,
}: Props) {
  // const { bottomOffset } = useKeyboardOffset();
  const isSubComment = !!parentCommentId;
  const [isSecret, setIsSecret] = useState(false);
  const [content, setContent] = useState("");

  const postCommentMutation = usePostCommentMutation();
  const postSubCommentMutation = usePostSubCommentMutation(
    parentCommentId ?? 0,
    dailyReportId,
  );

  const { showToast } = useToastStore();

  // 부모가 비밀댓글이면 자식은 무조건 비밀댓글
  const finalIsSecret = isParentCommentSecret ? true : isSecret;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // style={{
      //   paddingBottom: `${bottomOffset}px`,
      // }}
      className={clsx(
        "bg-surface-base w-full sm:w-[412px] sm:mx-auto fixed bottom-(--safe-bottom) inset-x-0 flex items-center gap-padding-x-s px-padding-x-s border-t border-t-border-base",
        isSubComment ? "h-[104px]" : "h-16",
      )}
    >
      <div
        // 엑세서리 바 누를 때 포커스 이탈 방지
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <CheckBox
          boxSize="s"
          textSize="text-caption-s"
          checked={finalIsSecret}
          onCheck={() => {
            if (isParentCommentSecret) {
              showToast({ message: "비공개 댓글의 답글은 비공개로 제한돼요." });
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
          setContent("");
          if (isSubComment) {
            postSubCommentMutation.mutate({
              content,
              isSecret: finalIsSecret,
            });
          } else {
            postCommentMutation.mutate({
              dailyReportId,
              content,
              isSecret: finalIsSecret,
            });
          }
        }}
      >
        <CommentInput
          value={content}
          parentCommentAuthorNickname={parentCommentAuthorNickname}
          onChange={(e) => setContent(e.target.value)}
          onResetSubCommentTarget={onResetSubCommentTarget}
        />
      </form>
    </motion.div>
  );
}
