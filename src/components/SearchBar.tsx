import clsx from "clsx";
import DeleteFilledIcon, { SearchIcon } from "./Icons";
import type { InputHTMLAttributes } from "react";
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
  return (
    <div
      className={clsx(
        "relative flex-1 px-padding-x-s rounded-full bg-field-bg-default border border-border-base flex items-center gap-gap-x-xs focus-within:shadow-1 focus-within:border-border-layer-1",
        className, // 높이나 패딩 넘겨줘야 함
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
        placeholder={emotion ? "" : "검색을 통해 기록을 되돌아보세요."}
        className="w-full text-caption-m placeholder:text-field-text-mute focus:outline-none"
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
