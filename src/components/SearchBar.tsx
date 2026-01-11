import clsx from "clsx";
import DeleteFilledIcon, { SearchIcon } from "./Icons";
import type { InputHTMLAttributes } from "react";

type Props = {
  value: string;
  onDelete: () => void;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function SearchBar({
  className,
  value,
  onDelete,
  ...props
}: Props) {
  return (
    <div
      className={clsx(
        "relative flex-1 px-padding-x-s py-padding-y-xs rounded-full bg-field-bg-default border border-border-base flex gap-gap-x-xs focus-within:shadow-1 focus-within:border-border-layer-1",
        className
      )}
    >
      <label htmlFor="search" className="cursor-pointer">
        <SearchIcon />
      </label>
      <input
        {...props}
        id="search"
        name="search"
        type="text"
        value={value}
        placeholder="키워드 검색으로 기록을 되돌아보세요."
        className="w-full text-caption-m placeholder:text-field-text-mute focus:outline-none"
      />
      <button
        onMouseDown={(e) => e.preventDefault()} // input에 포커스 유지
        onClick={onDelete}
        className={clsx(value ? "" : "invisible")}
      >
        <DeleteFilledIcon />
      </button>
    </div>
  );
}
