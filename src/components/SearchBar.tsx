import clsx from "clsx";
import DeleteFilledIcon, { SearchIcon } from "./Icons";
import { useState, type InputHTMLAttributes } from "react";
import emotions from "@/constants/emotions";
import { EmotionBadge } from "./Badges";

type Props = {
  emotion?: (typeof emotions)[number]["code"];
  onDeleteEmotion?: () => void;
  value: string;
  onDeleteKeyword: () => void;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function SearchBar({
  emotion,
  onDeleteEmotion,
  className,
  value,
  onDeleteKeyword,
  ...props
}: Props) {
  // 사파리에서 focus-with 안 되는 문제 대응
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={clsx(
        "relative px-padding-x-s rounded-full bg-field-bg-default border border-border-base flex items-center gap-gap-x-xs",
        className, // 높이나 패딩 넘겨줘야 함
        isFocused && "shadow-1 border-border-layer-1",
      )}
    >
      <label htmlFor="search" className="cursor-pointer">
        <SearchIcon />
      </label>
      {emotion && (
        <EmotionBadge
          emotion={emotion}
          onClick={() => onDeleteEmotion?.()}
          filled
          variant="search"
        />
      )}
      <input
        {...props}
        id="search"
        name="search"
        type="text"
        value={value}
        className="w-full text-caption-m placeholder:text-field-text-mute focus:outline-none"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()} // input에 포커스 유지
        onClick={() => {
          onDeleteKeyword();
          onDeleteEmotion?.();
        }}
        className={clsx(value || emotion ? "" : "hidden")}
      >
        <DeleteFilledIcon />
      </button>
    </div>
  );
}

type CommentInputProps = {
  value?: string;
  onDelete?: () => void;
  onClick?: () => void;
  readOnly?: boolean; // 모양만 두고 onClick 동작만 할 때
};

export function CommentInput({
  value,
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
    >
      <input
        id="comment"
        name="comment"
        type="text"
        value={value}
        disabled={readOnly}
        placeholder="댓글 남기기..."
        className="w-full text-caption-m placeholder:text-field-text-mute focus:outline-none"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onClick={onClick}
      />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()} // input에 포커스 유지
        onClick={() => {
          onDelete?.();
        }}
        className={clsx(value ? "" : "hidden")}
      >
        <DeleteFilledIcon />
      </button>
    </div>
  );
}
