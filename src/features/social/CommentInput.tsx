import { ArrowUpCircleFilledIcon } from "@/components/Icons";
import clsx from "clsx";
import { useState } from "react";

type CommentInputProps = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete?: () => void;
  onClick?: () => void;
  readOnly?: boolean; // 모양만 두고 onClick 동작만 할 때
};

export default function CommentInput({
  value,
  onChange,
  onDelete,
  onClick,
  readOnly,
}: CommentInputProps) {
  // 사파리에서 focus-with 안 되는 문제 대응
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div
      className={clsx(
        "relative w-full h-10 px-padding-x-s py-padding-y-s rounded-full bg-field-bg-default border border-border-base flex items-center gap-gap-x-xs",
        isFocused && "shadow-1 border-border-layer-1",
        readOnly && "cursor-pointer",
      )}
      onClick={onClick}
    >
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
        type="button"
        onMouseDown={(e) => e.preventDefault()} // input에 포커스 유지
        onClick={() => {
          onDelete?.();
        }}
        className={clsx(value ? "" : "hidden")}
      >
        <ArrowUpCircleFilledIcon />
      </button>
    </div>
  );
}
