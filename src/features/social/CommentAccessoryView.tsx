// 키보드 위에 올라오는 악세서리 뷰
// 댓글 작성 시 사용
import { motion } from "motion/react";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import CommentInput from "./CommentInput";
import CheckBox from "@/components/Checkbox";
import { useState } from "react";

export default function CommentAccessoryView() {
  const { bottomOffset } = useKeyboardOffset();
  const [isSecret, setIsSecret] = useState(false);
  const [content, setContent] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        paddingBottom: `${bottomOffset}px`,
      }}
      className="w-full sm:w-[412px] sm:mx-auto fixed bottom-0 inset-x-0 h-16 flex items-center gap-padding-x-s px-padding-x-s border-t border-t-border-base"
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
          checked={isSecret}
          onCheck={() => setIsSecret((prev) => !prev)}
          label="비밀 댓글"
          className="whitespace-pre"
        />
      </div>

      <CommentInput
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </motion.div>
  );
}
