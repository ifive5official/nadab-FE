// 댓글창의 Input
import { ArrowUpCircleFilledIcon, CloseIcon } from "@/components/Icons";
import useCommentInputStore from "@/store/commentInputStore";
import clsx from "clsx";

type CommentInputProps = {
  value?: string; // 댓글 내용
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // 댓글 내용 입력
  onClick?: () => void; // 모양만 두고 onClick 동작만 할 때 - 댓글창 열기 등
  readOnly?: boolean; // 모양만 두고 onClick 동작만 할 때
  onReset?: () => void;

  isFocused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
};

export default function CommentInput({
  value,
  onChange,
  onClick,
  readOnly,
  onReset,

  isFocused,
  onFocus,
  onBlur,
  inputRef,
}: CommentInputProps) {
  const { parentCommentAuthorNickname } = useCommentInputStore();

  const isSubmitAllowed =
    value && value.trim().length > 0 && value.length <= 500;

  return (
    <div
      className={clsx(
        "w-full overflow-hidden border border-border-base flex flex-col",
        isFocused && "shadow-1 border-border-layer-1",
        parentCommentAuthorNickname ? "rounded-[20px]" : "rounded-full",
        readOnly && "cursor-pointer",
      )}
      onClick={onClick}
      onPointerMove={(e) => e.stopPropagation()}
    >
      {parentCommentAuthorNickname && (
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
          ref={inputRef}
          id="comment"
          name="comment"
          type="text"
          value={value}
          placeholder="댓글 남기기..."
          className={clsx(
            "w-full text-caption-m placeholder:text-field-text-mute focus:outline-none",
            readOnly && "pointer-events-none",
          )}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onChange}
        />
        <button
          disabled={!isSubmitAllowed}
          onMouseDown={(e) => e.preventDefault()} // input에 포커스 유지
          className={clsx(value ? "" : "hidden")}
        >
          <ArrowUpCircleFilledIcon
            fill={
              isSubmitAllowed
                ? "var(--color-icon-default)"
                : "var(--color-icon-muted)"
            }
          />
        </button>
      </div>
    </div>
  );
}
