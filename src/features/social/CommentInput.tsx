import { ArrowUpCircleFilledIcon, CloseIcon } from "@/components/Icons";
import useCommentInputStore from "@/store/commentInputStore";
import clsx from "clsx";
import { useState } from "react";

type CommentInputProps = {
  value?: string; // 댓글 내용
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // 댓글 내용 입력
  onClick?: () => void; // 모양만 두고 onClick 동작만 할 때 - 댓글창 열기 등
  readOnly?: boolean; // 모양만 두고 onClick 동작만 할 때
  onReset?: () => void;
};

export default function CommentInput({
  value,
  onChange,
  onClick,
  readOnly,
  onReset,
}: CommentInputProps) {
  const { mode, parentCommentAuthorNickname } = useCommentInputStore();
  // 사파리에서 focus-with 안 되는 문제 대응
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={clsx(
        "w-full overflow-hidden border border-border-base flex flex-col",
        isFocused && "shadow-1 border-border-layer-1",
        mode === "SUB" ? "rounded-[20px]" : "rounded-full",
        readOnly && "cursor-pointer",
      )}
      onClick={onClick}
    >
      {mode === "SUB" && (
        <div className="h-10 px-padding-x-s bg-field-bg-muted flex justify-between items-center">
          <span className="text-caption-m">
            {parentCommentAuthorNickname}님에게 답글 남기는 중
          </span>
          <button type="button" onClick={onReset}>
            <CloseIcon size={20} />
          </button>
        </div>
      )}
      <div className="relative w-full h-10 px-padding-x-s py-padding-y-s bg-field-bg-default flex items-center gap-gap-x-xs">
        <input
          id="comment"
          name="comment"
          type="text"
          value={value}
          placeholder="댓글 남기기..."
          className={clsx(
            "w-full text-caption-m placeholder:text-field-text-mute focus:outline-none",
            readOnly && "pointer-events-none",
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={onChange}
        />
        <button
          onMouseDown={(e) => e.preventDefault()} // input에 포커스 유지
          className={clsx(value ? "" : "hidden")}
        >
          <ArrowUpCircleFilledIcon />
        </button>
      </div>
    </div>
  );
}
